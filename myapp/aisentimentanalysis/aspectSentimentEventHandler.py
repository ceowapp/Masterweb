from django.contrib.auth.decorators import login_required
import mimetypes
from django.http import JsonResponse
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from transformers import pipeline
from django.views.decorators.csrf import csrf_exempt
import torch.nn.functional as F  # Make sure you import this if not already imported
from myapp.aisentimentanalysis.aspectSentimentChecker import check_aspect_in_sentence
# Functions to handle requests from clientside
# Function to handle image processing

from transformers import AutoTokenizer, AutoModelForSequenceClassification, pipeline
import torch.nn.functional as F
from django.http import JsonResponse

def sentiment_processor(request):
    if request.method == "POST":
        sentence = request.POST.get('sentence_input')  # Use request.POST to get text input
        aspect = request.POST.get('aspect_input')  # Use request.POST to get text input
        if sentence and aspect:  # Use 'and' instead of '&'
            result = check_aspect_in_sentence(sentence, aspect)

            if result:  # Use 'result' instead of 'true'
                absa_tokenizer = AutoTokenizer.from_pretrained("yangheng/deberta-v3-base-absa-v1.1")
                absa_model = AutoModelForSequenceClassification.from_pretrained("yangheng/deberta-v3-base-absa-v1.1")

                # Load a traditional Sentiment Analysis model
                sentiment_model_path = "cardiffnlp/twitter-xlm-roberta-base-sentiment"
                sentiment_model = pipeline("sentiment-analysis", model=sentiment_model_path, tokenizer=sentiment_model_path)

                # Aspect-Based Sentiment Analysis
                inputs = absa_tokenizer(f"[CLS] {sentence} [SEP] {aspect} [SEP]", return_tensors="pt")
                outputs = absa_model(**inputs)
                probs = F.softmax(outputs.logits, dim=1)
                probs = probs.detach().numpy()[0]

                aspect_results = []
                for prob, label in zip(probs, ["negative", "neutral", "positive"]):
                    aspect_results.append({
                        "aspect_category": label,
                        "aspect_score": float(prob),
                    })

                # Sentence-Based Sentiment Analysis
                sentiment = sentiment_model([sentence])[0]

                sentence_result = {
                    "sentence_category": sentiment['label'],
                    "sentence_score": float(sentiment['score']),
                }

                return JsonResponse({"aspect_results": aspect_results, "sentence_result": sentence_result})
            else:
                # Handle the case where 'result' is False
                checking_result = {
                    "checking_result": result
                }
                return JsonResponse(checking_result)  # Return the result as JSON

        else:
            # Handle the case where no text input was provided
            return JsonResponse({"error": "Invalid input"}, status=400)  # Changed error message

    else:
        # Handle other HTTP methods (e.g., GET)
        return JsonResponse({"error": "Invalid request method"}, status=400)
