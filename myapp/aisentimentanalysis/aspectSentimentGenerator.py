from transformers import AutoTokenizer, AutoModelForSequenceClassification
from transformers import pipeline

# Function to handle requests from clientside
def aspectAnalysisProcessor():
    # Load Aspect-Based Sentiment Analysis model
    absa_tokenizer = AutoTokenizer.from_pretrained("yangheng/deberta-v3-base-absa-v1.1")
    absa_model = AutoModelForSequenceClassification.from_pretrained("yangheng/deberta-v3-base-absa-v1.1")

    # Load a traditional Sentiment Analysis model
    sentiment_model_path = "cardiffnlp/twitter-xlm-roberta-base-sentiment"
    sentiment_model = pipeline("sentiment-analysis", model=sentiment_model_path, tokenizer=sentiment_model_path)

    return absa_tokenizer, absa_model, sentiment_model
