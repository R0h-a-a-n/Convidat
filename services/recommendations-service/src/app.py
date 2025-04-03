from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import sys
import pandas as pd

# Add the parent directory to the sys.path to find recommender.py
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from recommender import CityRecommender  # Import your class

load_dotenv()

app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": "http://localhost:3000",
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Initialize the recommender
DATASET_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'okok.csv')
recommender = CityRecommender(csv_path=DATASET_PATH)

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
        pop_weight = data.get('popularity_weight', 0.85) # Default weights
        eco_weight = data.get('eco_weight', 0.15)

        if not all([season, climate, budget]):
            return jsonify({"error": "Missing required preferences: season, climate, budget"}), 400
        
        # Update weights if provided
        recommender.update_weights(pop_weight, eco_weight)

        # Get recommendations
        recs_df, message = recommender.recommend(
            season=season,
            climate=climate,
            budget=budget,
            num_recs=10, # Or get from request?
            metric="cosine" # Or get from request?
        )

        if recs_df is None:
            return jsonify({'recommendations': [], 'message': message})

        # Convert DataFrame to JSON serializable format
        recommendations_list = recs_df.where(pd.notna(recs_df), None).to_dict(orient='records')

        return jsonify({
            'recommendations': recommendations_list,
            'message': message
        })

    except Exception as e:
        app.logger.error(f"Error generating recommendations: {e}", exc_info=True)
        return jsonify({
            'error': str(e),
            'message': 'Error generating recommendations'
        }), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 3003))
    app.run(host='0.0.0.0', port=port, debug=True) 