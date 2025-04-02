from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.metrics.pairwise import cosine_similarity
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": "http://localhost:3000",
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Load and preprocess your dataset
# Replace this with your actual dataset loading logic
def load_dataset():
    # This is a placeholder. Replace with your actual dataset loading
    data = {
        'destination': ['Paris', 'London', 'Tokyo', 'New York', 'Barcelona'],
        'cost': [1000, 800, 1200, 1100, 900],
        'eco_friendly_score': [8, 7, 6, 5, 9],
        'popularity': [9, 8, 9, 8, 7],
        'cultural_score': [9, 8, 9, 8, 9],
    }
    return pd.DataFrame(data)

# Initialize the dataset
df = load_dataset()
scaler = StandardScaler()

# Preprocess the numerical columns
numerical_cols = ['cost', 'eco_friendly_score', 'popularity', 'cultural_score']
df[numerical_cols] = scaler.fit_transform(df[numerical_cols])

@app.route('/api/recommendations/test', methods=['GET'])
def test():
    return jsonify({"message": "Recommendations service is running!"})

@app.route('/api/recommendations', methods=['POST'])
def get_recommendations():
    try:
        data = request.get_json()
        preferences = {
            'budget': data.get('budget', 5),  # Scale of 1-10
            'eco_friendly': data.get('eco_friendly', 5),
            'popularity': data.get('popularity', 5),
            'cultural': data.get('cultural', 5)
        }

        # Create user preference vector
        user_preferences = np.array([
            preferences['budget'],
            preferences['eco_friendly'],
            preferences['popularity'],
            preferences['cultural']
        ]).reshape(1, -1)

        # Scale user preferences
        user_preferences_scaled = scaler.transform(user_preferences)

        # Calculate similarity scores
        similarity_scores = cosine_similarity(
            df[numerical_cols],
            user_preferences_scaled
        ).flatten()

        # Get top 3 recommendations
        top_indices = similarity_scores.argsort()[-3:][::-1]
        recommendations = []

        for idx in top_indices:
            recommendations.append({
                'destination': df.iloc[idx]['destination'],
                'similarity_score': float(similarity_scores[idx]),
                'eco_friendly_score': float(df.iloc[idx]['eco_friendly_score']),
                'cost_score': float(df.iloc[idx]['cost']),
                'cultural_score': float(df.iloc[idx]['cultural_score']),
                'popularity_score': float(df.iloc[idx]['popularity'])
            })

        return jsonify({
            'recommendations': recommendations
        })

    except Exception as e:
        return jsonify({
            'error': str(e),
            'message': 'Error generating recommendations'
        }), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 3003))
    app.run(host='0.0.0.0', port=port, debug=True) 