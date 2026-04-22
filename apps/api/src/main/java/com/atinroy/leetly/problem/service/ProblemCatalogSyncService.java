package com.atinroy.leetly.problem.service;

import com.atinroy.leetly.problem.model.Pattern;
import com.atinroy.leetly.problem.model.Topic;
import com.atinroy.leetly.problem.repository.PatternRepository;
import com.atinroy.leetly.problem.repository.TopicRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ProblemCatalogSyncService {

    private static final List<TopicSeed> TOPICS = List.of(
            new TopicSeed("Array", "Contiguous indexed collections and array manipulation."),
            new TopicSeed("Backtracking", "Systematic search with choices, pruning, and state rollback."),
            new TopicSeed("Binary Indexed Tree", "Fenwick tree structures for prefix queries and updates."),
            new TopicSeed("Binary Search", "Searching over sorted data or monotonic answer spaces."),
            new TopicSeed("Binary Tree", "Problems centered on rooted binary tree traversal and structure."),
            new TopicSeed("Bit Manipulation", "Problems that rely on bitwise operations and binary representation."),
            new TopicSeed("Bitmask", "State compression and subset reasoning with bitmasks."),
            new TopicSeed("Breadth-First Search", "Level-by-level traversal over graphs, trees, or state spaces."),
            new TopicSeed("Depth-First Search", "Recursive or stack-based traversal for exploration and decomposition."),
            new TopicSeed("Design", "Data structure and API design with specific behavioral constraints."),
            new TopicSeed("Divide and Conquer", "Splitting problems into smaller subproblems and combining results."),
            new TopicSeed("Dynamic Programming", "Optimal substructure and overlapping subproblems."),
            new TopicSeed("Enumeration", "Complete or constrained iteration over candidate states."),
            new TopicSeed("Graph", "General graph modeling, traversal, connectivity, and path reasoning."),
            new TopicSeed("Greedy", "Locally optimal choices justified by a global invariant."),
            new TopicSeed("Hash Table", "Constant-time lookup via hashing for counting, indexing, and grouping."),
            new TopicSeed("Heap (Priority Queue)", "Ordered extraction and scheduling with heaps or priority queues."),
            new TopicSeed("Linked List", "Pointer-based linear structures and node manipulation."),
            new TopicSeed("Math", "Arithmetic, number properties, formulas, and mathematical reasoning."),
            new TopicSeed("Matrix", "2D grid traversal, transformation, and matrix-specific state handling."),
            new TopicSeed("Monotonic Queue", "Queues that maintain monotonic order for window extrema."),
            new TopicSeed("Monotonic Stack", "Stacks that maintain monotonic order for nearest greater or smaller relationships."),
            new TopicSeed("Number Theory", "Divisibility, primes, modular arithmetic, and numeric structure."),
            new TopicSeed("Ordered Set", "Sorted sets or maps for predecessor, successor, and rank-style queries."),
            new TopicSeed("Prefix Sum", "Running aggregates for constant-time range computations."),
            new TopicSeed("Queue", "FIFO processing, buffering, and queue-based simulation."),
            new TopicSeed("Randomized", "Random sampling, probabilistic choices, or expected-value strategies."),
            new TopicSeed("Recursion", "Self-referential solutions and recursive decomposition."),
            new TopicSeed("Segment Tree", "Segment trees for range query and range update workflows."),
            new TopicSeed("Simulation", "Directly modeling the process described by the problem statement."),
            new TopicSeed("Sliding Window", "Expanding and shrinking contiguous ranges while tracking window state."),
            new TopicSeed("Sorting", "Ordering data to simplify comparisons, grouping, or scanning."),
            new TopicSeed("Stack", "LIFO processing, parsing, and stack-driven state management."),
            new TopicSeed("String", "String parsing, matching, construction, and transformation."),
            new TopicSeed("Topological Sort", "Ordering nodes in a directed acyclic dependency graph."),
            new TopicSeed("Tree", "General rooted tree structure, traversal, and subtree reasoning."),
            new TopicSeed("Trie", "Prefix trees for dictionary, prefix, and autocomplete operations."),
            new TopicSeed("Two Pointers", "Coordinated pointer movement across one or more sequences."),
            new TopicSeed("Union Find", "Disjoint set union for connectivity and component tracking.")
    );

    private static final List<PatternSeed> PATTERNS = List.of(
            new PatternSeed("Backtracking", "Build candidates incrementally and backtrack after exploring each choice.", "Backtracking", false),
            new PatternSeed("BFS", "Explore nodes or states in layers using a queue.", "Breadth-First Search", false),
            new PatternSeed("Binary Search", "Shrink a search space by testing a midpoint predicate.", "Binary Search", false),
            new PatternSeed("Binary Search on Answer", "Search the answer space using a monotonic feasibility check.", "Binary Search", false),
            new PatternSeed("Bitmask DP", "Use bitmasks to encode state inside a dynamic programming transition.", "Bitmask", false),
            new PatternSeed("Counting", "Track frequencies or counts to derive the answer directly.", "Hash Table", false),
            new PatternSeed("Cyclic Sort", "Place values into index-corresponding positions via swaps.", "Array", false),
            new PatternSeed("DFS", "Traverse deeply before backtracking, usually with recursion or a stack.", "Depth-First Search", false),
            new PatternSeed("Difference Array", "Apply range updates lazily and reconstruct via prefix accumulation.", "Prefix Sum", false),
            new PatternSeed("Digit DP", "Run dynamic programming over the digits of a bounded number.", "Dynamic Programming", false),
            new PatternSeed("Divide and Conquer", "Split into subproblems, solve independently, then merge.", "Divide and Conquer", false),
            new PatternSeed("Dynamic Programming", "Store solved subproblems and reuse them in later transitions.", "Dynamic Programming", false),
            new PatternSeed("Fast and Slow Pointers", "Move pointers at different speeds to detect structure.", "Two Pointers", false),
            new PatternSeed("Flood Fill", "Expand through connected cells or nodes from a starting source.", "Graph", false),
            new PatternSeed("Greedy", "Take the best local action while preserving a provable invariant.", "Greedy", false),
            new PatternSeed("Hashing", "Encode lookup state through hashed keys for fast access.", "Hash Table", false),
            new PatternSeed("Heap", "Maintain best-next candidates with a priority queue.", "Heap (Priority Queue)", false),
            new PatternSeed("In-Order Traversal", "Traverse left subtree, node, then right subtree.", "Binary Tree", false),
            new PatternSeed("Interval Merge", "Sort intervals, then collapse overlapping ranges in one pass.", "Sorting", false),
            new PatternSeed("Kadane's Algorithm", "Track the best subarray ending at each position.", "Dynamic Programming", true),
            new PatternSeed("Level-Order Traversal", "Process a tree level by level using queue-based traversal.", "Binary Tree", false),
            new PatternSeed("Line Sweep", "Sweep across sorted events while maintaining active state.", "Sorting", false),
            new PatternSeed("Memoization", "Cache recursive results by state to avoid recomputation.", "Dynamic Programming", false),
            new PatternSeed("Monotonic Queue", "Maintain a decreasing or increasing queue for window queries.", "Monotonic Queue", false),
            new PatternSeed("Monotonic Stack", "Maintain a monotonic stack for nearest greater or smaller lookups.", "Monotonic Stack", false),
            new PatternSeed("Multi-Source BFS", "Start BFS from every initial source at once.", "Breadth-First Search", false),
            new PatternSeed("Post-Order Traversal", "Traverse children before processing the current node.", "Tree", false),
            new PatternSeed("Prefix Sum", "Precompute cumulative values for fast range calculations.", "Prefix Sum", false),
            new PatternSeed("Pre-Order Traversal", "Process the current node before descending into children.", "Tree", false),
            new PatternSeed("Sliding Window", "Maintain a valid contiguous window while moving boundaries.", "Sliding Window", false),
            new PatternSeed("Sort and Scan", "Sort first, then answer with a linear pass.", "Sorting", false),
            new PatternSeed("Top-Down DP", "Use recursion with memoization to evaluate DP states on demand.", "Dynamic Programming", false),
            new PatternSeed("Topological Sort", "Order nodes by prerequisite edges in a DAG.", "Topological Sort", false),
            new PatternSeed("Tree DFS", "Use depth-first traversal to compute subtree information.", "Tree", false),
            new PatternSeed("Trie Traversal", "Walk or build a trie to process prefixes efficiently.", "Trie", false),
            new PatternSeed("Two Heaps", "Balance two heaps to track lower and upper partitions.", "Heap (Priority Queue)", false),
            new PatternSeed("Two Pointers", "Advance coordinated pointers to maintain a targeted relationship.", "Two Pointers", false),
            new PatternSeed("Union Find", "Merge and query connected components with disjoint sets.", "Union Find", false)
    );

    private final TopicRepository topicRepository;
    private final PatternRepository patternRepository;

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void syncCanonicalCatalog() {
        syncTopics();
        syncPatterns();
        prunePatterns();
        pruneTopics();
    }

    private void syncTopics() {
        for (TopicSeed seed : TOPICS) {
            Topic topic = topicRepository.findByName(seed.name())
                    .orElseGet(Topic::new);
            topic.setName(seed.name());
            topic.setDescription(seed.description());
            topicRepository.save(topic);
        }
    }

    private void syncPatterns() {
        Map<String, Topic> topicsByName = new LinkedHashMap<>();
        for (Topic topic : topicRepository.findAllByOrderByNameAsc()) {
            topicsByName.put(topic.getName(), topic);
        }

        for (PatternSeed seed : PATTERNS) {
            Pattern pattern = patternRepository.findByName(seed.name())
                    .orElseGet(Pattern::new);
            pattern.setName(seed.name());
            pattern.setDescription(seed.description());
            pattern.setTopic(topicsByName.get(seed.topicName()));
            pattern.setNamedAlgorithm(seed.namedAlgorithm());
            patternRepository.save(pattern);
        }
    }

    private void prunePatterns() {
        Set<String> canonicalNames = new LinkedHashSet<>();
        for (PatternSeed seed : PATTERNS) {
            canonicalNames.add(seed.name());
        }

        for (Pattern pattern : patternRepository.findAllByOrderByNameAsc()) {
            if (!canonicalNames.contains(pattern.getName())) {
                patternRepository.delete(pattern);
            }
        }
    }

    private void pruneTopics() {
        Set<String> canonicalNames = new LinkedHashSet<>();
        for (TopicSeed seed : TOPICS) {
            canonicalNames.add(seed.name());
        }

        for (Topic topic : topicRepository.findAllByOrderByNameAsc()) {
            if (!canonicalNames.contains(topic.getName())) {
                topicRepository.delete(topic);
            }
        }
    }

    private record TopicSeed(String name, String description) {}

    private record PatternSeed(String name, String description, String topicName, boolean namedAlgorithm) {}
}
