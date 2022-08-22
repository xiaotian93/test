import React, { Component } from 'react';
import { Row , Col , Button , Spin } from 'antd';
import moment from 'moment';

import { monthly_structure , rate_structure } from '../../ajax/api';
import { axios_monthly } from '../../ajax/request';
import { format_table_data,bmd } from '../../ajax/tool';
// import Filter from './../ui/Filter_nomal';
import TableCol from './../../templates/TableCol';
import { host_monthly } from './../../ajax/config';
import List from '../templates/list';
class Amount extends Component{
    constructor(props) {
        super(props);
        this.state = {
            index:props.index||"0",
            rate:{
            },
            filter:{
                startTime: moment().date(1).subtract(1,'months').format("YYYY-MM-DD"),
                endTime: moment().date(1).subtract(1,'days').format("YYYY-MM-DD")
            },
            name:""
        };
    }
    componentWillMount(){
        this.columns = [
            {
                title: '序号',
                dataIndex: 'key',
                render:(text,record,index)=>{
                    if(text==="合计"){
                        return text;
                    }
                    return `${index+1}`
                }
            },
            {
                title: '借款主体性质',
                dataIndex: 'classifyName',
            },
            {
                title: '累计投放笔数',
                dataIndex: 'countNum'
            },
            {
                title: '累计发放户数',
                dataIndex: 'countDistinctNum',
            },
            {
                title: '贷款余额',
                dataIndex: 'balance',
                sorter: (a, b) => {
                    return bmd.getSort(a,b,"balance")
                }
            },
            {
                title: '累计投放金额',
                dataIndex: 'sumLoanAmount',
                sorter: (a, b) => {
                    return bmd.getSort(a,b,"sumLoanAmount")
                }
            },
            {
                title:'累计投放占比',
                dataIndex:'percent'
            }
        ];
        this.rate = {
            "max":{
                name:"最高利率",
                width_key:"40%",
                span_val:7
            },
            "min":{
                name:"最低利率",
                span_val:7
            },
            "jiaquan":{
                name:"加权平均利率",
                span_val:7
            }
        }
        this.item_types = [
            {
                val:"借款主体性质划分",
                name:"主体性质"
            },
            {
                val:"借款额度划分",
                name:"借款额度"
            },
            {
                val:"借款利率划分",
                name:"借款利率"
            },
            {
                val:"借款期限划分",
                name:"借款期限"
            },
            {
                val:"借款行业类型划分",
                name:"行业类型"
            },
            {
                val:"借贷形态划分",
                name:"借贷形态"
            },
            {
                val:"担保方式划分",
                name:"担保方式"
            }
        ]
        this.filter = {
            time:{
                name:"放贷时间",
                type:"range_date",
                feild_s:"startTime",
                feild_e:"endTime",
                placeHolder:['开始日期',"结束日期"]
            },
            itemType:{
                name:"结构类型",
                type:"select",
                placeHolder:"请选择结构类型",
                values:this.item_types
            }
            // statusStr:{
            //     name:"状态",
            //     type:"select",
            //     placeHolder:"选择状态",
            //     values:[{name:"全部",val:""},{name:"未结清",val:"未结清"},{name:"已结清",val:"已结清"}]
            // }
        }
        // if(this.state.index===5){
        //     this.filter.deadLineTime = {
        //         name:"逾期截止日期",
        //         type:"date",
        //         placeHolder:"请选择截止日期"
        //     }
        // }
    }
    componentDidMount(){
        var select=window.localStorage.getItem(this.props.location.pathname);
        if(select){
            this.get_list(1,JSON.parse(select).remberData);
        }else{
            this.get_list();
        }
    }
    // 列表数据
    get_list(page_no , filter={}){
        let start = moment().date(1).subtract(1,'months').format("YYYY-MM-DD");
        let end = moment().date(1).subtract(1,'days').format("YYYY-MM-DD");
        let data = JSON.parse(JSON.stringify(filter));
        data.startTime=data.startTime?data.startTime:start;
        data.endTime=data.endTime?data.endTime:end;
        this.setState({
            loading:true
        })
        axios_monthly.post(monthly_structure,data).then((data)=>{
            let list = data.data;
            this.setState({
                data:format_table_data(list[this.state.index].monthReportItems),
                loading:false,
                name:list[this.state.index].name
            })
        });
    }
    // 利率分析
    get_rate(filter){
        let data = JSON.parse(JSON.stringify(filter||this.state.filter));
        axios_monthly.post(rate_structure,data).then(data=>{
            let obj = data.data;
            for(let o in obj){
                obj[o] = parseFloat(obj[o]).toFixed(2);
            }
            this.setState({
                rate:obj
            })
        })
    }
    // 获取筛选项
    get_filter(data){
        // let filter = {};
        // let dates = ["startTime","endTime","deadLineTime"];
        // for(let d in data){
        //     if(dates.includes(d)){
        //         filter[d] = moment(data[d]).format("YYYY-MM-DD");
        //         continue;
        //     }
        //     filter[d] = data[d]
        // }
        // if(this.state.index===5){
            // filter.deadLineTime = filter.endTime;
        // }
        this.setState({
            filter:data
        })
        // 列表数据
        this.get_list(1,data);
        // 获取利率
        this.get_rate(data);
    }
    // 设置筛选项默认值
    set_filter(filter){
        let start = moment().date(1).subtract(1,'months');
        let end = moment().date(1).subtract(1,'days');
        // filter.props.form.setFieldsValue({"time":[start,end]});
        // filter.props.form.setFieldsValue({"itemType":this.item_types[0].val});
        filter.setState({"time":[start,end]})
    }
    export_excel(){
        let filters = this.state.filter;
        let param = [];
        for(let f in filters){
            param.push(f+"="+filters[f]);
        }
        window.open(host_monthly+"month_report_detail/getAllMonthReportItemDetailExcel?"+param.join("&"));
    }
    render(){
        const table_props = {
            columns:this.columns ,
            dataSource:this.state.data,
            pagination : false
        }
        let display_rate = (this.state.filter.itemType==="借款利率划分"?"block":"none");
        const table={
            filter:{
                "data-get":this.get_filter.bind(this),
                "data-source":this.filter,
                "data-set":this.set_filter.bind(this),
                "data-paths":this.props.location.pathname,
                // itemType:this.item_types[0].val
            },
            tableInfo:table_props,
            tableTitle:{
                left:<span>金额单位：万元，保留六位小数</span>,
                right:<Button type="primary" onClick={this.export_excel.bind(this)}>导出</Button>
            }
        }
        return(
            <Spin spinning={this.state.loading}>
                <List {...table} />
                {/* <Filter data-get={this.get_filter.bind(this)} data-set={this.set_filter.bind(this)} data-source={this.filter} /> */}
                <Row style={{padding:"20px"}}>
                <Row style={{background:"#fff"}}>
                {/* <Row style={{margin:"15px 22px"}}>
                    <div className="text-right" style={{marginBottom:"10px",float:"right"}}>
                        <Button type="primary" onClick={this.export_excel.bind(this)}>导出</Button>
                    </div>
                    <span style={{marginTop:"10px",display:"inline-block"}}>单位：万元，保留六位小数</span>
                    <Table {...table_props} bordered />
                </Row> */}
                <Row className="content" style={{display:display_rate}}>
                    <div className="sub-title">此期间利率分析</div>
                    <Col span="8">
                        <TableCol data-source={this.state.rate} data-columns={this.rate} />
                    </Col>
                </Row>
                </Row>
                </Row>
                
            </Spin>
        )
    }
}

export default Amount;
