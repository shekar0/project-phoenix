"""LangGraph workflow — orchestrates the 6-agent generation pipeline."""

from langgraph.graph import END, StateGraph

from app.agents.evaluator_agent import evaluator_agent
from app.agents.generator_agent import generator_agent
from app.agents.parameter_agent import parameter_agent
from app.agents.prompt_agent import prompt_agent
from app.agents.safety_agent import safety_agent
from app.agents.style_agent import style_agent
from app.models.state import GenerationState


# ── Conditional edge functions ────────────────────────────────


def _after_safety(state: GenerationState) -> str:
    """Route to generator or abort if the safety agent flagged the prompt."""
    if state.get("error"):
        return "end"
    return "generate"


def _after_evaluation(state: GenerationState) -> str:
    """Retry generation when quality is poor (max 2 retries)."""
    if state.get("error"):
        return "end"
    quality = state.get("quality_score", 1.0)
    retries = state.get("retry_count", 0)
    if quality < 0.5 and retries < 2:
        return "retry"
    return "end"


# ── Graph construction ────────────────────────────────────────


def build_workflow():
    """Compile the LangGraph state-graph for content generation."""
    graph = StateGraph(GenerationState)

    # Nodes
    graph.add_node("prompt_agent", prompt_agent)
    graph.add_node("style_agent", style_agent)
    graph.add_node("parameter_agent", parameter_agent)
    graph.add_node("safety_agent", safety_agent)
    graph.add_node("generator_agent", generator_agent)
    graph.add_node("evaluator_agent", evaluator_agent)

    # Entry
    graph.set_entry_point("prompt_agent")

    # Linear edges
    graph.add_edge("prompt_agent", "style_agent")
    graph.add_edge("style_agent", "parameter_agent")
    graph.add_edge("parameter_agent", "safety_agent")

    # Conditional: safety → generator | END
    graph.add_conditional_edges(
        "safety_agent",
        _after_safety,
        {"generate": "generator_agent", "end": END},
    )

    graph.add_edge("generator_agent", "evaluator_agent")

    # Conditional: evaluator → retry (generator) | END
    graph.add_conditional_edges(
        "evaluator_agent",
        _after_evaluation,
        {"retry": "generator_agent", "end": END},
    )

    return graph.compile()


# Compiled graph instance — ready for ``ainvoke``
generation_graph = build_workflow()
