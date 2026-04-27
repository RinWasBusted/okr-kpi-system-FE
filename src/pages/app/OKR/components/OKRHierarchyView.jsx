import { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
} from 'reactflow';
import { hierarchy, tree } from 'd3-hierarchy';
import { Target, Eye, EyeOff, Globe, ChevronDown, ChevronUp, TrendingUp, Loader2 } from 'lucide-react';
import { getKeyResults } from '../../../../services/okr';
import { useTheme } from '../../../../hooks/useTheme';
import 'reactflow/dist/style.css';

// Status badge component matching ObjectiveItem style
const StatusBadge = ({ status, progressStatus }) => {
  const getStatusConfig = () => {
    // First check objective status
    switch (status) {
      case 'Draft':
        return { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Bản nháp' };
      case 'Active':
        return { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Hoạt động' };
      case 'Pending_Approval':
        return { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Chờ duyệt' };
      case 'Rejected':
        return { bg: 'bg-red-100', text: 'text-red-700', label: 'Từ chối' };
      case 'Completed':
        return { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Hoàn thành' };
      default:
        break;
    }

    // Fallback to progress status
    switch (progressStatus) {
      case 'COMPLETED':
        return { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'completed' };
      case 'ON_TRACK':
        return { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'on-track' };
      case 'WARNING':
        return { bg: 'bg-orange-100', text: 'text-orange-700', label: 'at-risk' };
      case 'DANGER':
      case 'NOT_STARTED':
        return { bg: 'bg-red-100', text: 'text-red-700', label: 'at-risk' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700', label: status?.toLowerCase() || 'draft' };
    }
  };

  const config = getStatusConfig();

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
};

// Visibility badge component - compact version
const VisibilityBadge = ({ visibility }) => {
  const getConfig = () => {
    switch (visibility) {
      case 'PUBLIC':
        return { icon: Globe, color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Công khai' };
      case 'INTERNAL':
        return { icon: EyeOff, color: 'text-cyan-600', bg: 'bg-cyan-50', label: 'Nội bộ' };
      case 'PRIVATE':
        return { icon: Eye, color: 'text-gray-600', bg: 'bg-gray-100', label: 'Riêng tư' };
      default:
        return { icon: Eye, color: 'text-gray-600', bg: 'bg-gray-100', label: 'Riêng tư' };
    }
  };

  const config = getConfig();
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${config.bg} ${config.color}`} title={config.label}>
      <Icon size={10} />
      {config.label}
    </span>
  );
};

// Progress bar component
const ProgressBar = ({ percentage }) => {
  const getColor = (value) => {
    if (value >= 80) return 'bg-emerald-500';
    if (value >= 50) return 'bg-cyan-500';
    if (value >= 30) return 'bg-orange-400';
    return 'bg-red-500';
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-secondary">Progress</span>
        <span className="text-sm font-semibold text-text">{percentage || 0}%</span>
      </div>
      <div className="h-2 bg-secondary/10 rounded-full overflow-hidden">
        <div
          className={`h-full ${getColor(percentage)} rounded-full transition-all duration-300`}
          style={{ width: `${Math.min(percentage || 0, 100)}%` }}
        />
      </div>
    </div>
  );
};

// Key Result Item - compact display
const KeyResultItem = ({ kr }) => {
  const progress = kr.progress_percentage || 0;

  const getProgressColor = (value) => {
    if (value >= 80) return 'bg-emerald-500';
    if (value >= 50) return 'bg-cyan-500';
    if (value >= 30) return 'bg-orange-400';
    return 'bg-red-500';
  };

  return (
    <div className="py-2 border-b border-secondary/10 last:border-b-0">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-text truncate" title={kr.title}>
            {kr.title}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-1.5 bg-secondary/10 rounded-full overflow-hidden">
              <div
                className={`h-full ${getProgressColor(progress)} rounded-full`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <span className="text-[10px] font-medium text-secondary">
              {progress}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Key Results Section for Node
const KeyResultsSection = ({ objectiveId }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const queryClient = useQueryClient();
  const [hasPrefetched, setHasPrefetched] = useState(false);

  // Prefetch on hover
  const handleMouseEnter = useCallback(() => {
    if (!hasPrefetched) {
      queryClient.prefetchQuery({
        queryKey: ['keyResults', objectiveId],
        queryFn: () => getKeyResults(objectiveId, { per_page: 100 }),
        staleTime: 5 * 60 * 1000,
      });
      setHasPrefetched(true);
    }
  }, [queryClient, objectiveId, hasPrefetched]);

  const { data: keyResultsData, isLoading } = useQuery({
    queryKey: ['keyResults', objectiveId],
    queryFn: () => getKeyResults(objectiveId, { per_page: 100 }),
    enabled: isExpanded,
    staleTime: 5 * 60 * 1000,
  });

  const keyResults = keyResultsData?.data || [];

  return (
    <div className="mt-3 pt-3 border-t border-secondary/10" onMouseEnter={handleMouseEnter}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsExpanded(!isExpanded);
        }}
        className="flex items-center gap-1.5 text-xs font-medium text-text hover:text-primary transition-colors cursor-pointer w-full"
      >
        <TrendingUp size={14} className="text-primary" />
        <span>Các Kết quả then chốt</span>
        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {isExpanded && (
        <div className="mt-2">
          {isLoading ? (
            <div className="flex items-center gap-2 py-3 text-secondary">
              <Loader2 size={14} className="animate-spin" />
              <span className="text-xs">Đang tải...</span>
            </div>
          ) : keyResults.length === 0 ? (
            <p className="py-3 text-xs text-secondary">Chưa có key result nào</p>
          ) : (
            <div className="bg-secondary/5 rounded-lg px-3 max-h-40 overflow-y-auto">
              {keyResults.map((kr) => (
                <KeyResultItem key={kr.id} kr={kr} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Custom Node Component for React Flow
const ObjectiveNode = ({ data }) => {
  const navigate = useNavigate();
  const { company_slug } = useParams();
  const { objective } = data;

  const hasChildren = objective.sub_objectives && objective.sub_objectives.length > 0;
  const isExpanded = data.isExpanded;

  const handleDetailClick = () => {
    navigate(`/${company_slug}/app/okr/${objective.id}`);
  };

  const handleToggleExpand = (e) => {
    e.stopPropagation();
    data.onToggleExpand(objective.id);
  };

  const getBorderColor = () => {
    if (objective.progress_status === 'DANGER' || objective.progress_status === 'NOT_STARTED') {
      return 'border-red-300';
    }
    if (objective.progress_status === 'WARNING') {
      return 'border-orange-300';
    }
    return 'border-primary';
  };

  return (
    <div className={`w-72 bg-background rounded-xl border-2 ${getBorderColor()} shadow-lg hover:shadow-xl transition-shadow relative`}>
      {/* Target Handle - nhận edge từ node cha */}
      <Handle
        type="target"
        position={Position.Top}
        className="opacity-0 w-full h-2 top-0"
      />

      {/* Header with icon, status and visibility */}
      <div className="p-3 pb-2">
        <div className="flex items-start gap-2">
          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
            <Target size={16} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-text text-sm leading-tight line-clamp-2" title={objective.title}>
              {objective.title}
            </h3>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <StatusBadge status={objective.status} progressStatus={objective.progress_status} />
              <VisibilityBadge visibility={objective.visibility} />
            </div>
          </div>
        </div>
      </div>

      {/* Unit and Owner info - compact */}
      <div className="px-3 py-1">
        <div className="flex items-center gap-1 text-xs text-secondary">
          <span className="truncate">{objective.unit?.name || 'No Unit'}</span>
          {objective.owner && (
            <>
              <span>•</span>
              <span className="truncate">{objective.owner.full_name}</span>
            </>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-3 py-2">
        <ProgressBar percentage={objective.progress_percentage} />
      </div>

      {/* Action buttons */}
      <div className="px-3 pb-3 pt-1">
        <KeyResultsSection objectiveId={objective.id} />

        <div className="flex gap-2 mt-3">
          <button
            onClick={handleDetailClick}
            className="flex-1 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
          >
            Chi tiết
          </button>

          {hasChildren && (
            <button
              onClick={handleToggleExpand}
              className="flex items-center justify-center gap-1 px-3 py-2 bg-secondary/10 text-secondary text-sm font-medium rounded-lg hover:bg-secondary/20 transition-colors cursor-pointer"
            >
              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              {isExpanded ? 'Thu gọn' : 'Mở rộng'}
            </button>
          )}
        </div>
      </div>

      {/* Source Handle - xuất edge xuống node con */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="opacity-0 w-full h-2 bottom-0"
      />
    </div>
  );
};

// Node types for React Flow
const nodeTypes = {
  objective: ObjectiveNode,
};

// Transform hierarchical data to React Flow nodes and edges
const transformHierarchyToFlow = (objectives, expandedNodes, toggleExpand) => {
  const nodes = [];
  const edges = [];

  // Create a flat list of visible objectives based on expanded state
  const visibleObjectives = [];

  const addVisibleNodes = (obj, parentId = null, level = 0) => {
    const nodeId = `objective-${obj.id}`;

    visibleObjectives.push({
      id: nodeId,
      objective: obj,
      parentId,
      level,
    });

    // Create edge from parent if exists
    if (parentId) {
      edges.push({
        id: `edge-${parentId}-${nodeId}`,
        source: parentId,
        target: nodeId,
        type: 'smoothstep',
        animated: true,
        style: {
          stroke: '#ea580c',
          strokeWidth: 4,
        },
        markerEnd: {
          type: 'arrowclosed',
          width: 15,
          height: 15,
          color: '#ea580c',
        },
      });
    }

    // Recursively add children if expanded
    const hasChildren = obj.sub_objectives && obj.sub_objectives.length > 0;
    const isExpanded = expandedNodes.has(obj.id);

    if (hasChildren && isExpanded) {
      obj.sub_objectives.forEach(child => {
        addVisibleNodes(child, nodeId, level + 1);
      });
    }
  };

  objectives.forEach(obj => {
    addVisibleNodes(obj, null, 0);
  });

  // Use D3 hierarchy to calculate positions
  if (visibleObjectives.length === 0) {
    return { initialNodes: [], initialEdges: [] };
  }

  // Create a hierarchy structure for D3
  const createHierarchyData = () => {
    const rootNodes = [];
    const nodeMap = new Map();

    visibleObjectives.forEach(({ id, objective, parentId }) => {
      const node = {
        id,
        data: { objective, parentId, isExpanded: expandedNodes.has(objective.id) },
        children: [],
      };
      nodeMap.set(id, node);

      if (!parentId) {
        rootNodes.push(node);
      }
    });

    // Link children to parents
    visibleObjectives.forEach(({ id, parentId }) => {
      if (parentId && nodeMap.has(parentId)) {
        const parent = nodeMap.get(parentId);
        const child = nodeMap.get(id);
        if (parent && child) {
          parent.children.push(child);
        }
      }
    });

    return rootNodes;
  };

  const rootNodes = createHierarchyData();

  // Calculate positions using D3 tree layout for each root
  let currentX = 0;
  const nodeSpacingX = 360; // Width + gap
  const nodeSpacingY = 420; // Height + gap

  rootNodes.forEach(rootNode => {
    // Create D3 hierarchy from our structure
    const root = hierarchy(rootNode);

    // Calculate tree layout
    const treeLayout = tree().nodeSize([nodeSpacingX, nodeSpacingY]);
    treeLayout(root);

    // Assign positions from D3 layout
    root.descendants().forEach((d3Node, index) => {
      const nodeData = d3Node.data;
      const x = currentX + d3Node.x - (root.x || 0); // Center the tree
      const y = d3Node.depth * nodeSpacingY;

      nodes.push({
        id: nodeData.id,
        type: 'objective',
        position: { x, y },
        sourcePosition: 'bottom', // Edges exit from bottom
        targetPosition: 'top',    // Edges enter from top
        data: {
          ...nodeData.data,
          isExpanded: expandedNodes.has(nodeData.data.objective.id),
          onToggleExpand: toggleExpand,
        },
      });
    });

    // Update currentX for next tree
    const treeWidth = root.descendants().length > 1
      ? Math.max(...root.descendants().map(d => d.x)) - Math.min(...root.descendants().map(d => d.x)) + nodeSpacingX
      : nodeSpacingX;
    currentX += treeWidth;
  });

  return { initialNodes: nodes, initialEdges: edges };
};

// Main component
const OKRHierarchyView = ({ objectives }) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const [expandedNodes, setExpandedNodes] = useState(() => {
    // Initialize with all objectives expanded by default
    const initialExpanded = new Set();
    const addAllIds = (objs) => {
      objs.forEach(obj => {
        initialExpanded.add(obj.id);
        if (obj.sub_objectives?.length > 0) {
          addAllIds(obj.sub_objectives);
        }
      });
    };
    addAllIds(objectives);
    return initialExpanded;
  });

  const toggleExpand = useCallback((objectiveId) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(objectiveId)) {
        newSet.delete(objectiveId);
      } else {
        newSet.add(objectiveId);
      }
      return newSet;
    });
  }, []);

  // Calculate nodes and edges from hierarchy
  const { initialNodes, initialEdges } = useMemo(() => {
    return transformHierarchyToFlow(objectives, expandedNodes, toggleExpand);
  }, [objectives, expandedNodes, toggleExpand]);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Update nodes and edges when calculated values change
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

    // Use fitView only once when React Flow initializes
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [hasFitted, setHasFitted] = useState(false);

  useEffect(() => {
    if (reactFlowInstance && nodes.length > 0 && !hasFitted) {
      setTimeout(() => {
        reactFlowInstance.fitView({ padding: 0.2, duration: 200 });
        setHasFitted(true);
      }, 100);
    }
  }, [reactFlowInstance, nodes, hasFitted]);

  if (objectives.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-background rounded-xl border border-secondary/20">
        <div className="text-center">
          <Target size={48} className="mx-auto mb-4 opacity-50 text-secondary" />
          <p className="text-secondary">Chưa có Objective nào</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-200 bg-background rounded-xl border border-secondary/20 overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        onInit={setReactFlowInstance}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={2}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#ea580c', strokeWidth: 4 },
          markerEnd: {
            type: 'arrowclosed',
            width: 15,
            height: 15,
            color: '#ea580c',
          },
        }}
        proOptions={{ hideAttribution: true }}
        elevateEdgesOnSelect={true}
        connectionLineStyle={{ stroke: '#ea580c', strokeWidth: 3 }}
      >
        <Background color="#CBD5E1" gap={16} size={1} />
        <Controls />
        <MiniMap
          nodeColor="#ea580c"
          nodeStrokeColor="#ea580c"
          nodeBorderRadius={12}
          maskColor={isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.1)'}
          style={{
            backgroundColor: 'var(--background)',
            borderRadius: '16px',
            border: '2px solid #ea580c',
          }}
        />
      </ReactFlow>
    </div>
  );
};

export default OKRHierarchyView;
