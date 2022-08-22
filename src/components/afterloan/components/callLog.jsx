import React, { Component } from 'react';
import { Form } from 'antd';
// import Filter from '../ui/Filter_nomal';
import { axios_postloan } from '../../../ajax/request';
// import { host_xjd } from '../../../ajax/config';
import { afterloan_call_list } from '../../../ajax/api';
import { page } from '../../../ajax/config';
import { format_table_data } from '../../../ajax/tool';
// import Permissions from '../../templates/Permissions';
import List from '../../templates/list';
import ComponentRoute from '../../../templates/ComponentRoute';
import Auido from "./audio";
class Overdue extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            modalVisible: false,
            total: [],
            filter: {
                name: props.location.query.name || "",
                relation: props.location.query.relation || ""
            },
            pageSize: page.size,
            data: [],
            list: [],
            listPage: 1,
            contractId: props.location.query.contractId,
            contractsId: props.location.query.contractsId,
            borrowerId: props.location.query.borrowerId,
            type: props.location.query.type,
        };
        this.loader = [];
        this.playArr = [];
    }
    componentWillMount() {
        this.columns = [
            {
                title: '序号',
                dataIndex: 'key',
                render: (text, record, index) => {
                    if (text === "合计") {
                        return text;
                    }
                    return `${index + 1}`
                }
            },
            {
                title: '通话时间',
                dataIndex: 'callBeginTime',
            },
            {
                title: '关系',
                dataIndex: 'relation',
                render: e => {
                    var type = { SELF: "本人", SPOUSE: "配偶", SON: "子", DAUGHTER: "女", PARENT: "父母", BROTHER_OR_SISTER: "兄弟姐妹", FRIEND: "朋友", COLLEAGUE: "同事", OTHER: "其他" }
                    return type[e] || "--"
                }
            },
            {
                title: '姓名',
                dataIndex: 'name'
            },
            {
                title: '手机号',
                dataIndex: 'phone',
            },
            {
                title: '催收员',
                dataIndex: 'operator',
            },
            {
                title: '呼叫类型',
                dataIndex: 'callType',
                render: e => {
                    var type = { AGENT_MANUAL: "坐席-人工外呼", AGENT_AI_NOT_MANUAL: "坐席-AI外呼-不转人工", AGENT_AI_THEN_MANUAL: "坐席-AI外呼-接通转人工", AGENT_AI_CONDITION_MANUAL: "坐席-AI外呼-智能转人工", BATCH_PREDICTED: "批量-预测外呼", BATCH_AI_NOT_AGENT: "批量-AI外呼-不转人工", BATCH_AI_THEN_AGENT: "批量-AI外呼-接通转人工", BATCH_AI_CONDITION_AGENT: "批量-AI外呼-智能转人工", BATCH_VOICE_NOTICE: "批量-语音通知" };
                    return type[e] || "--"
                }
            },
            {
                title: '呼叫结果',
                dataIndex: 'callResult',
                render: e => {
                    var type = { ANSWERED: "已接听", OFF: "关机", NO_EXIST: "空号", CHANGED: "改号", SERVICE_STOP: "停机", BUSY: "占线", REFUSED: "拒接", NOT_CONNECT: "无法接通", MISSED: "未接", ARREARS: "用户欠费", LINE_FAULT: "线路故障", CALL_FAIL: "呼叫失败", GET_VOICE_GW_FAIL: "获取语音网关信息失败", AGENT_NOT_ANSWER: "坐席未接听" };
                    return type[e] || "--"
                }
            },
            {
                title: '通话时长',
                dataIndex: 'callDuration',
                render: e => {
                    e = (e / 60 / 1000).toFixed(2);
                    return e + "分钟"
                }
            },
            {
                title: "通话录音",
                key: 'remindTime',
                render: e => {
                    return <Auido src={e.requestNo} data={this.state.data} play={this.play.bind(this)} isPlay={e.isPlay} id={e.requestNo} onRef={this.audioRef.bind(this)} getUrl={e.getUrl} />
                }
            },
        ];
        // repay_status_select.unshift({name:"全部",val:""});
        this.filter = {
            relation: {
                name: "关系",
                type: "select",
                values: [{ val: "SELF", name: "本人" }, { val: "SPOUSE", name: "配偶" }, { val: "SON", name: "子" }, { val: "DAUGHTER", name: "女" }, { val: "PARENT", name: "父母" }, { val: "BROTHER_OR_SISTER", name: "兄弟姐妹" }, { val: "FRIEND", name: "朋友" }, { val: "COLLEAGUE", name: "同事" }, { val: "OTHER", name: "其他" }]
            },
            name: {
                name: "姓名",
                type: "text",
                placeHolder: "请输入客户名称"
            },
            phone: {
                name: "手机号",
                type: "text",
                placeHolder: "请输入客户名称"
            },
        }
    }
    componentDidMount() {
        var select = window.localStorage.getItem(this.props.location.pathname);
        if (select) {
            if (JSON.stringify(JSON.parse(select).remberData) !== "{}" || JSON.parse(select).isRember) {
                this.get_list(1, JSON.parse(select).remberData);
            } else {
                this.get_list(1, this.props.location.query.name ? this.state.filter : {});
            }
        } else {
            this.get_list(1, this.props.location.query.name ? this.state.filter : {});
        }
        // this.get_total();
    }
    audioRef(e) {
        this.audio_child = e
    }
    play(id) {
        var data = this.state.data;
        data.forEach(item => {
            if (item.requestNo === id) {
                item.isPlay = true;
                item.getUrl = true;
            } else {
                item.isPlay = false
                this.audio_child.pauseAudio();
            }
        })
        this.setState({
            data: data
        })
    }
    get_list(page_no = 1, filter = {}) {
        let rqd = JSON.parse(JSON.stringify(filter));
        rqd.contractId = this.state.contractId;
        if (this.state.type === "ALL") {
            rqd.contactsId = "";
            rqd.borrowerId = ""
        } else if (this.state.type === "SELF") {
            rqd.borrowerId = this.state.borrowerId;
            rqd.contactsId = "";
        } else {
            rqd.contactsId = this.state.contractsId || "";
            rqd.borrowerId = ""
        }
        rqd.size = page.size;
        rqd.page = page_no;
        this.setState({
            loading: true
        })
        this.loader.push("list");
        axios_postloan.post(afterloan_call_list,rqd
        ).then((data) => {
            let detail = data.data.list;
            if (!data.code && detail) {
                this.loader.splice(this.loader.indexOf("list"), 1);
                this.setState({
                    list: format_table_data(detail, page_no, page.size),
                    loading: this.loader.length > 0,
                    // total:detail.length>0?[total]:null,
                    pageTotal: data.data.total,
                    pageCurrent: data.data.current,
                    // current:detail.current
                });
                (this.loader.length <= 0) && this.refresh_tabel("list");
            } else {
                this.setState({
                    loading: false
                })
            }
        }).catch(e => {
            this.setState({
                loading: false
            })
        });
    }
    // 刷新列表数据
    refresh_tabel(type) {
        this.setState({
            // data:this.state.list.length>0?this.state.list.concat(this.state.total):this.state.list
            data: this.state.list.concat(this.state.total)
        })
    }
    get_filter(data) {
        // let paths = this.props.location.pathname;
        // window.localStorage.setItem(paths,JSON.stringify(data))
        let filter = {};
        filter = JSON.parse(JSON.stringify(data));
        this.setState({
            filter: filter
        })
        this.get_list(this.state.listPage, filter);
    }
    // 翻页
    page_up(page, pageSize) {
        window.scrollTo(0, 0);
        this.setState({
            modalVisible: false
        })
        this.get_list(page, this.state.filter);
    }
    showTotal() {
        return "共" + this.state.pageTotal + "条数据"
    }
    render() {
        var page = parseInt(this.state.pageTotal / (this.state.pageSize + 1), 10);
        let pagination = {
            total: this.state.pageTotal + page,
            current: this.state.pageCurrent,
            pageSize: this.state.pageSize + 1,
            showTotal: this.showTotal.bind(this),
            onChange: this.page_up.bind(this)
        }
        const table_props = {
            rowKey: "key",
            columns: this.columns,
            dataSource: this.state.data,
            pagination: pagination,
            loading: this.state.loading,
            footer: () => this.state.totalDes,
            rowClassName: function (data) {
            }
        }
        const table = {
            filter: {
                "data-get": this.get_filter.bind(this),
                "data-source": this.filter,
                "phase": this.state.phase,
                "data-paths": this.props.location.pathname,
                relation: this.props.location.query.relation,
                name: this.props.location.query.name,
            },
            tableInfo: table_props,
            tableTitle: {
                left: null,
                right: null
            }
        }
        return (

            <div>
                <List {...table} />
            </div>
        )
    }
}

export default ComponentRoute(Form.create()(Overdue));
