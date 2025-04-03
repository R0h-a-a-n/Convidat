import pandas as pd
import numpy as np
from sklearn.decomposition import TruncatedSVD
from sklearn.metrics.pairwise import cosine_similarity
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class CityRecommender:
    def __init__(self, csv_path, pop_weight=0.85, eco_weight=0.15):
        self.popularity_weight = pop_weight
        self.eco_weight = eco_weight
        self.cache = {}
        self.df = self.load_data(csv_path)
        self.compute_embeddings()

    def load_data(self, csv_path):
        try:
            df = pd.read_csv(csv_path)
            logging.info("Dataset loaded successfully.")

            numeric_cols = ["popularity_score", "eco_score"]
            for col in numeric_cols:
                df[col] = df[col].fillna(df[col].median())

            cat_cols = ["City", "COUNTRY", "season", "preferred_climate", "budget"]
            for col in cat_cols:
                df[col] = df[col].fillna(df[col].mode()[0])

            return df
        except Exception as e:
            logging.error(f"Error loading dataset: {e}")
            raise

    def compute_embeddings(self):
        self.df["combined_score"] = (self.popularity_weight * self.df["popularity_score"] +
                                     self.eco_weight * self.df["eco_score"])

        self.ranking_matrix = pd.pivot_table(
            self.df, values="combined_score", index="City", columns="season", fill_value=0
        )

        self.svd = TruncatedSVD(n_components=2, random_state=42)
        latent_features = self.svd.fit_transform(self.ranking_matrix)

        self.city_embeddings = pd.DataFrame(
            latent_features, index=self.ranking_matrix.index, columns=["dim1", "dim2"]
        )

        city_info = self.df[["City", "COUNTRY", "season", "preferred_climate", "budget", "combined_score"]].drop_duplicates()
        self.city_embeddings = self.city_embeddings.merge(city_info, on="City")
        logging.info("Embeddings computed successfully.")

    def update_weights(self, pop_weight, eco_weight):
        total = pop_weight + eco_weight
        if total == 0:
            pop_weight, eco_weight = 0.85, 0.15
        else:
            pop_weight, eco_weight = pop_weight / total, eco_weight / total

        self.popularity_weight = pop_weight
        self.eco_weight = eco_weight
        self.compute_embeddings()
        self.cache = {}
        logging.info(f"Weights updated: Popularity = {pop_weight:.2f}, Eco = {eco_weight:.2f}")

    def _get_target_vector(self, df_matches, metric):
        if metric == "euclidean":
            return df_matches[["dim1", "dim2"]].mean().values
        elif metric == "cosine":
            vecs = df_matches[["dim1", "dim2"]].values
            norms = np.linalg.norm(vecs, axis=1, keepdims=True)
            vecs_normed = vecs / np.where(norms == 0, 1, norms)
            return np.mean(vecs_normed, axis=0)
        else:
            raise ValueError("Invalid similarity metric")

    def _compute_similarity(self, candidate, target, metric):
        vec = candidate[["dim1", "dim2"]].values.reshape(1, -1)
        if metric == "euclidean":
            return np.linalg.norm(vec - target)
        elif metric == "cosine":
            sim = cosine_similarity(vec, target.reshape(1, -1))[0][0]
            return -sim
        else:
            raise ValueError("Unknown similarity metric")

    def recommend(self, season, climate, budget, num_recs=10, metric="euclidean"):
        cache_key = (season, climate, budget, num_recs, metric)
        if cache_key in self.cache:
            logging.info("Returning cached recommendations.")
            return self.cache[cache_key]

        exact_matches = self.city_embeddings[
            (self.city_embeddings["season"] == season) &
            (self.city_embeddings["preferred_climate"] == climate) &
            (self.city_embeddings["budget"] == budget)
        ]

        if not exact_matches.empty:
            target_vector = self._get_target_vector(exact_matches, metric)
            df_exact = exact_matches.copy()
            df_exact["similarity_score"] = df_exact.apply(
                lambda row: self._compute_similarity(row, target_vector, metric), axis=1
            )
            recs = df_exact.sort_values("similarity_score").head(num_recs)
            recs["Recommendation_Type"] = "Exact Match"
            message = "Found exact matches. Recommendations based on latent similarity."
        else:
            temp = self.city_embeddings.copy()
            temp["match_score"] = (
                (temp["season"] == season).astype(int) +
                (temp["preferred_climate"] == climate).astype(int) +
                (temp["budget"] == budget).astype(int)
            )
            candidates = temp[temp["match_score"] > 0]
            if candidates.empty:
                logging.warning("No recommendations found after relaxing filters.")
                return None, "No recommendations found even after relaxing filters."

            recs = candidates.sort_values(["match_score", "combined_score"], ascending=False).head(num_recs)
            recs["similarity_score"] = None  # ✅ JSON-safe null instead of NaN
            recs["combined_score"] = recs["combined_score"].fillna(0.0)  # ✅ Prevent NaNs
            recs["Recommendation_Type"] = "Relaxed Match"
            message = "⚠ No exact matches found. Showing best approximate recommendations."

        self.cache[cache_key] = (recs, message)
        return recs, message
