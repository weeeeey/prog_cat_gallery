const URL = 'https://l9817xtkq3.execute-api.ap-northeast-2.amazonaws.com/dev';

const request = async (nanoId) => {
    try {
        const res = await fetch(URL + nanoId);
        if (!res.ok) throw new Error('서버 상태 이상');
        return res.json();
    } catch (error) {
        throw new Error('에러');
    }
};

export const loading_req = async ({ nodeId = '', setLoading }) => {
    try {
        setLoading(true);
        const nodes = await request(nodeId);
        return nodes;
    } catch (error) {
        throw new Error('에러');
    } finally {
        setLoading(false);
    }
};
