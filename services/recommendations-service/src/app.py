from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import sys
import pandas as pd
import logging

# Add the parent directory to the sys.path to find recommender.py
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from recommender import CityRecommender  # Import your class

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    filename='app.log'
)

load_dotenv()
app = Flask(__name__)
CORS(app,
     resources={
         r"/*": {
             "origins": ["http://localhost:3000"],
             "methods": ["GET", "POST", "OPTIONS"],
             "allow_headers": ["Content-Type", "Authorization"],
             "supports_credentials": True
         }
     })

# Initialize the recommender
DATASET_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'okok.csv')
recommender = CityRecommender(csv_path=DATASET_PATH, n_components=4)

@app.route('/api/recommendations/test', methods=['GET'])
def test():
    return jsonify({"message": "Recommendations service is running!"})

@app.route('/api/recommendations', methods=['POST'])
def get_recommendations():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Missing JSON payload"}), 400
       
        # Get preferences from the request
        season = data.get('season')
        climate = data.get('climate')
        budget = data.get('budget')
        pop_weight = data.get('popularity_weight', 0.85)  # Default weights
        eco_weight = data.get('eco_weight', 0.15)
        num_recs = data.get('num_recommendations', 10)
        metric = data.get('metric', 'weighted')  # Use our new default metric
        fallback_strategy = data.get('fallback_strategy', 'hybrid')
        min_match_score = data.get('min_match_score', 0)
        
        # Validate inputs
        if not any([season, climate, budget]):
            return jsonify({"error": "At least one preference (season, climate, or budget) is required"}), 400
            
        # Validate numeric inputs
        try:
            pop_weight = float(pop_weight)
            eco_weight = float(eco_weight)
            num_recs = int(num_recs)
            min_match_score = int(min_match_score)
        except (ValueError, TypeError):
            return jsonify({"error": "Invalid numeric parameters"}), 400
        
        # Validate metric
        if metric not in ["euclidean", "cosine", "weighted"]:
            return jsonify({"error": f"Invalid metric: {metric}. Must be 'euclidean', 'cosine', or 'weighted'"}), 400
            
        # Validate fallback strategy
        if fallback_strategy not in ["hybrid", "popularity", "similarity"]:
            return jsonify({"error": f"Invalid fallback strategy: {fallback_strategy}. Must be 'hybrid', 'popularity', or 'similarity'"}), 400
       
        # Update weights if provided
        recommender.update_weights(pop_weight, eco_weight)
        
        # Get recommendations with enhanced parameters
        recs_df, message = recommender.recommend(
            season=season,
            climate=climate,
            budget=budget,
            num_recs=num_recs,
            metric=metric,
            min_match_score=min_match_score,
            fallback_strategy=fallback_strategy
        )
        
        if recs_df is None:
            return jsonify({'recommendations': [], 'message': message})
        
        # Convert DataFrame to JSON serializable format
        recommendations_list = recs_df.where(pd.notna(recs_df), None).to_dict(orient='records')
        
        return jsonify({
            'recommendations': recommendations_list,
            'message': message,
            'total_results': len(recommendations_list),
            'params': {
                'season': season,
                'climate': climate, 
                'budget': budget,
                'pop_weight': pop_weight,
                'eco_weight': eco_weight,
                'metric': metric,
                'fallback_strategy': fallback_strategy
            }
        })
        
    except Exception as e:
        app.logger.error(f"Error generating recommendations: {e}", exc_info=True)
        return jsonify({
            'error': str(e),
            'message': 'Error generating recommendations'
        }), 500

@app.route('/api/city/<city_name>', methods=['GET'])
def get_city_details(city_name):
    """API endpoint to get details about a specific city"""
    try:
        city_data, similar_cities = recommender.get_city_details(city_name)
        
        if city_data is None:
            return jsonify({"error": "City not found"}), 404
            
        # Convert DataFrame to dict
        city_info = city_data.to_dict(orient='records')[0]
        
        # Get similar cities if available
        similar_list = []
        if similar_cities is not None:
            similar_list = similar_cities.where(pd.notna(similar_cities), None).to_dict(orient='records')
            
        return jsonify({
            'city': city_name,
            'details': city_info,
            'similar_cities': similar_list
        })
        
    except Exception as e:
        app.logger.error(f"Error fetching city details: {e}", exc_info=True)
        return jsonify({
            'error': str(e),
            'message': 'Error fetching city details'
        }), 500

@app.route('/api/metadata', methods=['GET'])
def get_metadata():
    """Return metadata about the dataset for UI dropdowns"""
    try:
        # Extract unique values for the dropdown filters
        seasons = recommender.df['season'].unique().tolist()
        climates = recommender.df['preferred_climate'].unique().tolist()
        budgets = recommender.df['budget'].unique().tolist()
        countries = recommender.df['COUNTRY'].unique().tolist()
        
        return jsonify({
            'seasons': seasons,
            'climates': climates,
            'budgets': budgets,
            'countries': countries,
            'total_cities': len(recommender.df['City'].unique())
        })
        
    except Exception as e:
        app.logger.error(f"Error fetching metadata: {e}", exc_info=True)
        return jsonify({
            'error': str(e),
            'message': 'Error fetching metadata'
        }), 500

@app.route('/api/top_cities', methods=['GET'])
def get_top_cities():
    """Return top cities based on popularity/eco scores"""
    try:
        count = request.args.get('count', 10, type=int)
        sort_by = request.args.get('sort_by', 'combined_score')
        
        if sort_by not in ['combined_score', 'popularity_score', 'eco_score']:
            return jsonify({"error": f"Invalid sort parameter: {sort_by}"}), 400
            
        top_cities = recommender.df.sort_values(sort_by, ascending=False) \
                              .drop_duplicates(subset=['City']) \
                              .head(count)
        
        # Convert to dict for JSON response
        cities_list = top_cities[['City', 'COUNTRY', 'popularity_score', 'eco_score', 'combined_score']] \
                             .where(pd.notna(top_cities), None) \
                             .to_dict(orient='records')
        
        return jsonify({
            'cities': cities_list,
            'sort_by': sort_by
        })
        
    except Exception as e:
        app.logger.error(f"Error fetching top cities: {e}", exc_info=True)
        return jsonify({
            'error': str(e),
            'message': 'Error fetching top cities'
        }), 500

@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Resource not found"}), 404

@app.errorhandler(500)
def server_error(e):
    return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 3003))
    app.run(host='0.0.0.0', port=port, debug=True)