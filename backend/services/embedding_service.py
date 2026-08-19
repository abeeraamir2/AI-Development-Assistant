# backend/services/embedding_service.py
from FlagEmbedding import BGEM3FlagModel
import torch

_model = None


def _get_model():
    global _model
    if _model is None:
        use_fp16 = torch.cuda.is_available()  
        _model = BGEM3FlagModel("BAAI/bge-m3", use_fp16=use_fp16)
    return _model


def embed_texts(texts: list[str]) -> list[list[float]]:

    if not texts:
        return []
    model = _get_model()
    output = model.encode(
        texts,
        return_dense=True,
        return_sparse=False,
        return_colbert_vecs=False,
    )
    return output["dense_vecs"].tolist()


def embed_text(text: str) -> list[float]:
    return embed_texts([text])[0]