import pandas as pd
import numpy as np
from sklearn.decomposition import TruncatedSVD
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import MinMaxScaler
import logging
from functools import lru_cache

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class CityRecommender:
    def __init__(self, csv_path, pop_weight=0.85, eco_weight=0.15, n_components=4):
        self.popularity_weight = pop_weight
        self.eco_weight = eco_weight
        self.n_components = n_components
        self.df = self.load_data(csv_path)
        self.compute_embeddings()
        self.scaler = MinMaxScaler()
        self.city_embeddings[['dim1', 'dim2', 'dim3', 'dim4']] = self.scaler.fit_transform(
            self.city_embeddings[['dim1', 'dim2', 'dim3', 'dim4']]
        )

    def load_data(self, csv_path):
        try:
            df = pd.read_csv(csv_path)
            logging.info("Dataset loaded successfully.")

            numeric_cols = ["popularity_score", "eco_score"]
            for col in numeric_cols:
                df[col] = df[col].fillna(df[col].mean())
                mean, std = df[col].mean(), df[col].std()
                df[col] = df[col].clip(mean - 3*std, mean + 3*std)

            cat_cols = ["City", "COUNTRY", "season", "preferred_climate", "budget"]
            for col in cat_cols:
                df[col] = df[col].fillna(df[col].mode()[0])

            df = df.drop_duplicates(subset=['City', 'season', 'preferred_climate', 'budget'])
            return df
        except Exception as e:
            logging.error(f"Error loading dataset: {e}")
            raise

    def compute_embeddings(self):
        pop_min, pop_max = self.df["popularity_score"].min(), self.df["popularity_score"].max()
        eco_min, eco_max = self.df["eco_score"].min(), self.df["eco_score"].max()

        self.df["pop_norm"] = (self.df["popularity_score"] - pop_min) / (pop_max - pop_min)
        self.df["eco_norm"] = (self.df["eco_score"] - eco_min) / (eco_max - eco_min)

        self.df["combined_score"] = (self.popularity_weight * self.df["pop_norm"] +
                                      self.eco_weight * self.df["eco_norm"])

        self.ranking_matrix = pd.pivot_table(
            self.df, values="combined_score", index="City", columns="season", fill_value=0
        )

        climate_matrix = pd.pivot_table(
            self.df, values="combined_score", index="City", columns="preferred_climate", fill_value=0
        )

        budget_matrix = pd.pivot_table(
            self.df, values="combined_score", index="City", columns="budget", fill_value=0
        )

        combined_matrix = pd.concat([self.ranking_matrix, climate_matrix, budget_matrix], axis=1)
        combined_matrix = combined_matrix.loc[:, ~combined_matrix.columns.duplicated()]

        self.svd = TruncatedSVD(n_components=self.n_components, random_state=42)
        latent_features = self.svd.fit_transform(combined_matrix)

        self.city_embeddings = pd.DataFrame(
            latent_features,
            index=combined_matrix.index,
            columns=[f"dim{i+1}" for i in range(self.n_components)]
        )

        city_info = self.df[["City", "COUNTRY", "season", "preferred_climate", "budget", "combined_score"]].drop_duplicates()
        self.city_embeddings = self.city_embeddings.merge(city_info, on="City")

        explained_var = self.svd.explained_variance_ratio_.sum()
        logging.info(f"Embeddings computed successfully. Total explained variance: {explained_var:.2%}")

    @lru_cache(maxsize=128)
    def update_weights(self, pop_weight, eco_weight):
        total = pop_weight + eco_weight
        if total == 0:
            pop_weight, eco_weight = 0.85, 0.15
        else:
            pop_weight, eco_weight = pop_weight / total, eco_weight / total

        self.popularity_weight = pop_weight
        self.eco_weight = eco_weight
        self.compute_embeddings()
        logging.info(f"Weights updated: Popularity = {pop_weight:.2f}, Eco = {eco_weight:.2f}")

    def _get_target_vector(self, df_matches, metric):
        feature_cols = [f"dim{i+1}" for i in range(self.n_components)]
        if metric == "euclidean":
            return df_matches[feature_cols].mean().values
        elif metric == "cosine":
            vecs = df_matches[feature_cols].values
            norms = np.linalg.norm(vecs, axis=1, keepdims=True)
            vecs_normed = vecs / np.where(norms == 0, 1, norms)
            return np.mean(vecs_normed, axis=0)
        elif metric == "weighted":
            weights = df_matches["combined_score"].values
            if weights.sum() == 0:
                return df_matches[feature_cols].mean().values
            weights = weights / weights.sum()
            return np.average(df_matches[feature_cols].values, axis=0, weights=weights)
        else:
            raise ValueError("Invalid similarity metric")

    def _compute_similarity(self, candidate, target, metric):
        feature_cols = [f"dim{i+1}" for i in range(self.n_components)]
        vec = candidate[feature_cols].values.reshape(1, -1)
        if metric == "euclidean":
            return np.linalg.norm(vec - target)
        elif metric == "cosine":
            sim = cosine_similarity(vec, target.reshape(1, -1))[0][0]
            return -sim
        elif metric == "weighted":
            euc_dist = np.linalg.norm(vec - target)
            cos_sim = cosine_similarity(vec, target.reshape(1, -1))[0][0]
            return 0.5 * euc_dist - 0.5 * cos_sim
        else:
            raise ValueError("Unknown similarity metric")

    def recommend(self, season=None, climate=None, budget=None, num_recs=10, metric="weighted", 
                  min_match_score=0, fallback_strategy="hybrid"):
        filters = {}
        if season is not None:
            filters["season"] = season
        if climate is not None:
            filters["preferred_climate"] = climate
        if budget is not None:
            filters["budget"] = budget

        if not filters:
            top_cities = self.city_embeddings.sort_values("combined_score", ascending=False).head(num_recs)
            return top_cities.copy(), "Showing top cities based on overall score."

        exact_matches = self.city_embeddings.copy()
        for k, v in filters.items():
            exact_matches = exact_matches[exact_matches[k] == v]
        exact_matches = exact_matches.copy()

        if len(exact_matches) >= 3:
            target_vector = self._get_target_vector(exact_matches, metric)
            df_exact = exact_matches.copy()
            feature_cols = [f"dim{i+1}" for i in range(self.n_components)]
            df_exact.loc[:, "similarity_score"] = df_exact.apply(
                lambda row: self._compute_similarity(row, target_vector, metric), axis=1
            )
            df_exact.loc[:, "rank_score"] = (
                0.7 * df_exact["similarity_score"].rank(pct=True) +
                0.3 * (1 - df_exact["combined_score"].rank(pct=True))
            )
            recs = df_exact.sort_values("rank_score").head(num_recs).copy()
            recs["Recommendation_Type"] = "Exact Match"
            message = "Found exact matches for your preferences."
        else:
            temp = self.city_embeddings.copy()
            for k, v in filters.items():
                temp.loc[:, f"match_{k}"] = (temp[k] == v).astype(int)
            temp.loc[:, "match_score"] = sum(temp[f"match_{k}"] for k in filters)
            candidates = temp[temp["match_score"] > min_match_score].copy()
            if candidates.empty:
                logging.warning("No recommendations found after relaxing filters.")
                return None, "No recommendations found, please try different preferences."
            if fallback_strategy == "hybrid" and len(exact_matches) > 0:
                target_vector = self._get_target_vector(exact_matches, metric)
                feature_cols = [f"dim{i+1}" for i in range(self.n_components)]
                candidates.loc[:, "similarity_score"] = candidates.apply(
                    lambda row: self._compute_similarity(row, target_vector, metric), axis=1
                )
                candidates.loc[:, "rank_score"] = (
                    0.4 * (candidates["match_score"] / len(filters)) +
                    0.3 * candidates["similarity_score"].rank(pct=True) +
                    0.3 * (1 - candidates["combined_score"].rank(pct=True))
                )
                recs = candidates.sort_values("rank_score").head(num_recs).copy()
            elif fallback_strategy == "similarity" and len(exact_matches) > 0:
                target_vector = self._get_target_vector(exact_matches, metric)
                feature_cols = [f"dim{i+1}" for i in range(self.n_components)]
                candidates.loc[:, "similarity_score"] = candidates.apply(
                    lambda row: self._compute_similarity(row, target_vector, metric), axis=1
                )
                recs = candidates.sort_values("similarity_score").head(num_recs).copy()
            else:
                candidates.loc[:, "rank_score"] = (
                    0.7 * (candidates["match_score"] / len(filters)) +
                    0.3 * (1 - candidates["combined_score"].rank(pct=True))
                )
                recs = candidates.sort_values("rank_score").head(num_recs).copy()
            recs["Recommendation_Type"] = "Relaxed Match"
            matched_criteria = [k for k, v in filters.items() if len(exact_matches) > 0 and 
                                not exact_matches.empty and exact_matches[k].iloc[0] == v]
            if matched_criteria:
                message = f"Found partial matches. Matching on: {', '.join(matched_criteria)}."
            else:
                message = "⚠ No exact matches found. Showing best approximate recommendations."

        for k, v in filters.items():
            recs.loc[:, f"Matches_{k}"] = (recs[k] == v).map({True: "✓", False: "✗"})

        if "similarity_score" not in recs.columns:
            recs["similarity_score"] = 0
        recs["similarity_score"] = recs["similarity_score"].fillna(0).round(3)
        recs["combined_score"] = recs["combined_score"].fillna(0).round(3)

        return recs, message

    def get_city_details(self, city_name):
        if city_name not in self.city_embeddings.index:
            return None, "City not found"
        city_data = self.city_embeddings[self.city_embeddings.index == city_name]
        similar_cities = self.recommend_similar_to_city(city_name, 5)
        return city_data, similar_cities

    def recommend_similar_to_city(self, city_name, num_similar=5):
        if city_name not in self.city_embeddings.index:
            return None
        feature_cols = [f"dim{i+1}" for i in range(self.n_components)]
        target_city_embedding = self.city_embeddings.loc[city_name, feature_cols].values.reshape(1, -1)
        other_cities = self.city_embeddings[self.city_embeddings.index != city_name].copy()
        other_cities["similarity"] = other_cities.apply(
            lambda row: -cosine_similarity(row[feature_cols].values.reshape(1, -1), target_city_embedding)[0][0],
            axis=1
        )
        return other_cities.sort_values("similarity").head(num_similar)
