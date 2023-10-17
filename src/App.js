import Breadcrumb from './Breadcrumb.js';
import { loading_req } from './Api.js';

const cache = {};
export default function App($app) {
    this.state = {
        isRoot: false,
        nodes: [],
        depth: [],
        seletedFilePath: null,
        isLoading: false,
    };
    this.setState = (nextState) => {
        this.state = nextState;
        breadcrumb.setState(this.state.depth);
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
}
