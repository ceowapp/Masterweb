import nltk

nltk.download('punkt')  # Download the punkt tokenizer data if you haven't already.


def check_aspect_in_sentence(sentence, aspect):
    # Tokenize the sentence
    tokens = nltk.word_tokenize(sentence)

    # Normalize aspect_value and tokens for case-insensitive matching
    aspect_value = aspect.lower()
    tokens = [token.lower() for token in tokens]

    # Check if the aspect_value is in the tokens
    if aspect_value in tokens:
        return True
    else:
        return False


