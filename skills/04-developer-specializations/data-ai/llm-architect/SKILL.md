---
name: llm-architect
description: Large language model systems, prompt engineering, RAG architectures, fine-tuning, and building production LLM applications
metadata:
  version: "1.0.0"
  tier: developer-specialization
  category: data-ai
  council: code-review-council
---

# LLM Architect

You embody the perspective of an LLM Architect with expertise in designing and building production systems powered by large language models.

## When to Apply

Invoke this skill when:
- Designing LLM-powered applications
- Implementing RAG (Retrieval-Augmented Generation)
- Prompt engineering and optimization
- Fine-tuning models
- Building agent systems
- Evaluating LLM outputs
- Managing costs and latency

## Core Competencies

### 1. LLM Integration
- API integration patterns
- Token management
- Error handling and fallbacks
- Cost optimization

### 2. RAG Systems
- Document processing
- Embedding strategies
- Vector databases
- Retrieval optimization

### 3. Prompt Engineering
- Prompt design patterns
- Few-shot learning
- Chain-of-thought
- System prompts

### 4. Agent Systems
- Tool use and function calling
- Multi-agent architectures
- Planning and reasoning
- Memory systems

## RAG Architecture

### System Design
```
┌─────────────────────────────────────────────────────────┐
│                    User Query                            │
└────────────────────────┬────────────────────────────────┘
                         │
          ┌──────────────▼──────────────┐
          │    Query Understanding      │
          │  (Rewrite, Expansion)       │
          └──────────────┬──────────────┘
                         │
          ┌──────────────▼──────────────┐
          │    Retrieval Pipeline       │
          │  ┌────────┐ ┌────────┐     │
          │  │Semantic│ │Keyword │     │
          │  │Search  │ │Search  │     │
          │  └───┬────┘ └───┬────┘     │
          │      └────┬─────┘          │
          │           ▼                 │
          │    Reranking & Fusion      │
          └──────────────┬──────────────┘
                         │
          ┌──────────────▼──────────────┐
          │    Context Assembly         │
          │  (Top-K, Deduplication)     │
          └──────────────┬──────────────┘
                         │
          ┌──────────────▼──────────────┐
          │    LLM Generation           │
          │  (With Retrieved Context)   │
          └──────────────┬──────────────┘
                         │
          ┌──────────────▼──────────────┐
          │    Post-processing          │
          │  (Citations, Formatting)    │
          └─────────────────────────────┘
```

### RAG Implementation
```python
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import Pinecone
from langchain.chains import RetrievalQA

# Document processing
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200,
    separators=["\n\n", "\n", " ", ""]
)
chunks = text_splitter.split_documents(documents)

# Embedding and storage
embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
vectorstore = Pinecone.from_documents(
    chunks,
    embeddings,
    index_name="knowledge-base"
)

# Retrieval chain
retriever = vectorstore.as_retriever(
    search_type="mmr",  # Maximum Marginal Relevance
    search_kwargs={"k": 5, "fetch_k": 20}
)

qa_chain = RetrievalQA.from_chain_type(
    llm=ChatOpenAI(model="gpt-4", temperature=0),
    chain_type="stuff",
    retriever=retriever,
    return_source_documents=True
)
```

## Prompt Engineering

### System Prompt Design
```python
SYSTEM_PROMPT = """You are a helpful assistant for {company_name}.

## Your Role
- Answer questions about our products and services
- Be accurate and cite sources when available
- Admit when you don't know something

## Guidelines
- Keep responses concise (2-3 paragraphs max)
- Use bullet points for lists
- Include relevant product links when helpful

## Constraints
- Never make up information
- Don't discuss competitors
- Redirect off-topic questions politely

## Context
Today's date: {date}
User tier: {user_tier}
"""
```

### Few-Shot Pattern
```python
def build_few_shot_prompt(query: str, examples: list[dict]) -> str:
    """Build few-shot prompt with examples."""
    
    example_text = "\n\n".join([
        f"Question: {ex['question']}\nAnswer: {ex['answer']}"
        for ex in examples
    ])
    
    return f"""Here are some examples of how to answer questions:

{example_text}

Now answer this question in the same style:
Question: {query}
Answer:"""
```

### Chain-of-Thought
```python
COT_PROMPT = """Let's solve this step by step:

1. First, let me understand what we're looking for
2. Then, I'll identify the relevant information
3. Next, I'll reason through the logic
4. Finally, I'll provide my answer

Question: {question}

Let's begin:"""
```

## Agent Systems

### Tool-Using Agent
```python
from langchain.agents import AgentExecutor, create_openai_functions_agent
from langchain.tools import Tool

# Define tools
tools = [
    Tool(
        name="search_knowledge_base",
        description="Search the company knowledge base for information",
        func=knowledge_base_search
    ),
    Tool(
        name="get_customer_info",
        description="Retrieve customer information by ID",
        func=get_customer_info
    ),
    Tool(
        name="create_support_ticket",
        description="Create a support ticket for the customer",
        func=create_support_ticket
    ),
]

# Create agent
agent = create_openai_functions_agent(
    llm=ChatOpenAI(model="gpt-4"),
    tools=tools,
    prompt=agent_prompt
)

executor = AgentExecutor(
    agent=agent,
    tools=tools,
    max_iterations=5,
    verbose=True
)
```

### Multi-Agent System
```python
class AgentOrchestrator:
    def __init__(self):
        self.router = RouterAgent()
        self.agents = {
            "research": ResearchAgent(),
            "coding": CodingAgent(),
            "analysis": AnalysisAgent(),
        }
    
    async def process(self, task: str) -> str:
        # Route to appropriate agent
        agent_type = await self.router.route(task)
        
        # Execute with selected agent
        agent = self.agents[agent_type]
        result = await agent.execute(task)
        
        # Validate output
        if not self.validate(result):
            result = await self.fallback(task)
        
        return result
```

## Evaluation

### LLM Output Evaluation
```python
from ragas import evaluate
from ragas.metrics import (
    faithfulness,
    answer_relevancy,
    context_precision,
    context_recall
)

# Evaluate RAG system
results = evaluate(
    dataset,
    metrics=[
        faithfulness,      # Is answer grounded in context?
        answer_relevancy,  # Is answer relevant to question?
        context_precision, # Is retrieved context relevant?
        context_recall     # Did we retrieve all needed info?
    ]
)

print(results)
```

### Custom Evaluation
```python
def evaluate_response(
    query: str,
    response: str,
    expected: str,
    evaluator_llm
) -> dict:
    """Use LLM as judge for evaluation."""
    
    eval_prompt = f"""Evaluate the following response:

Query: {query}
Expected Answer: {expected}
Actual Response: {response}

Rate on these dimensions (1-5):
1. Accuracy: Does the response match expected answer?
2. Completeness: Does it cover all important points?
3. Clarity: Is it well-written and clear?

Return JSON: {{"accuracy": X, "completeness": X, "clarity": X, "reasoning": "..."}}"""

    result = evaluator_llm.invoke(eval_prompt)
    return json.loads(result)
```

## Cost Optimization

### Token Management
```python
import tiktoken

def count_tokens(text: str, model: str = "gpt-4") -> int:
    """Count tokens in text."""
    encoding = tiktoken.encoding_for_model(model)
    return len(encoding.encode(text))

def truncate_to_token_limit(
    text: str,
    max_tokens: int,
    model: str = "gpt-4"
) -> str:
    """Truncate text to token limit."""
    encoding = tiktoken.encoding_for_model(model)
    tokens = encoding.encode(text)
    
    if len(tokens) <= max_tokens:
        return text
    
    return encoding.decode(tokens[:max_tokens])
```

### Caching Strategy
```python
import hashlib
from functools import lru_cache

class LLMCache:
    def __init__(self, redis_client):
        self.redis = redis_client
        self.ttl = 3600  # 1 hour
    
    def get_cache_key(self, prompt: str, model: str) -> str:
        content = f"{model}:{prompt}"
        return hashlib.sha256(content.encode()).hexdigest()
    
    async def get_or_generate(
        self,
        prompt: str,
        model: str,
        generate_fn
    ) -> str:
        key = self.get_cache_key(prompt, model)
        
        # Check cache
        cached = await self.redis.get(key)
        if cached:
            return cached
        
        # Generate and cache
        result = await generate_fn(prompt)
        await self.redis.setex(key, self.ttl, result)
        return result
```

## Anti-Patterns to Avoid

| Anti-Pattern | Better Approach |
|--------------|-----------------|
| No error handling | Graceful degradation |
| No output validation | Guardrails and checks |
| Ignoring latency | Streaming, caching |
| No cost monitoring | Token tracking |
| Prompt injection risk | Input sanitization |

## Constraints

- Validate all LLM outputs
- Implement rate limiting
- Monitor costs continuously
- Handle failures gracefully
- Test with edge cases

## Related Skills

- `ml-engineer` - ML infrastructure
- `backend-developer` - API integration
- `security-engineer` - Prompt injection defense
