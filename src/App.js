import Loading from './Loading.js';
import Breadcrumb from './Breadcrumb.js';
import Node from './Node.js';
import { loading_req } from './Api.js';
import ImageViewer from './ImageViewer.js';

const cache = {};

export default function App($app) {
    this.state = {
        isRoot: false,
        nodes: [],
        depth: [],
        seletedFilePath: null,
        isLoading: false,
    };
    const loading = new Loading({
        $app,
        initialState: this.state.isLoading,
    });
    const breadcrumb = new Breadcrumb({
        $app,
        initialState: this.state.depth,
        onClick: (index) => {
            if (index === null) {
                this.setState({
                    ...this.state,
                    isRoot: true,
                    depth: [],
                    nodes: cache.root,
                });
                return;
            }
            if (index === this.state.depth.length - 1) return;

            const nextDepth = this.state.depth.slice(0, index + 1);

            this.setState({
                ...this.state,
                depth: nextDepth,
                nodes: cache[nextDepth[nextDepth.length - 1].id],
            });
        },
    });
    const nodes = new Node({
        $app,
        initialState: { isRoot: this.state.isRoot, nodes: this.state.nodes },
        onClick: async (node) => {
            try {
                if (node.type === 'DIRECTORY') {
                    const nextNodes = cache[node.id]
                        ? cache[node.id]
                        : await loading_req({
                              nodeId: `/${node.id}`,
                              setLoading: (bool) => {
                                  this.setState({
                                      ...this.state,
                                      isLoading: bool,
                                  });
                              },
                          });
                    cache[node.id] = nextNodes;
                    this.setState({
                        ...this.state,
                        isRoot: false,
                        nodes: nextNodes,
                        depth: [...this.state.depth, node],
                    });
                } else if (node.type === 'FILE') {
                    this.setState({
                        ...this.state,
                        selectedFilePath: node.filePath,
                    });
                }
                console.log(node);
            } catch (error) {
                throw new Error(error.message);
            }
        },
        onBackClick: async () => {
            try {
                const nextState = { ...this.state };
                nextState.depth.pop();
                const prevNodeId = nextState.depth.length
                    ? nextState.depth[nextState.depth.length - 1].id
                    : null;
                this.setState({
                    ...nextState,
                    isRoot: !prevNodeId,
                    nodes: prevNodeId ? cache[prevNodeId] : cache.root,
                });
            } catch (e) {
                throw new Error(e.message);
            }
        },
    });
    const imageView = new ImageViewer({
        $app,
        initialState: this.state.seletedFilePath,
        onClick: (e) => {
            if (e.target.nodeName !== 'IMG')
                this.setState({ ...this.state, seletedFilePath: null });
        },
    });

    this.setState = (nextState) => {
        this.state = nextState;
        breadcrumb.setState(this.state.depth);
        nodes.setState({ isRoot: this.state.isRoot, nodes: this.state.nodes });
        loading.setState(this.state.isLoading);
        imageView.setState(this.state.seletedFilePath);
    };

    this.init = async () => {
        try {
            const rootNodes = await loading_req({
                setLoading: (bool) => {
                    this.setState({
                        ...this.state,
                        isLoading: bool,
                    });
                },
            });
            console.log(rootNodes);
            this.setState({
                ...this.state,
                isRoot: true,
                nodes: rootNodes,
            });
            cache.root = rootNodes;
        } catch (error) {
            throw new Error(error);
        }
    };
    this.init();
}
