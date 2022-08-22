import React, { Component } from 'react';
import { Input , Button , message } from 'antd';

// import Filter from '../../ui/Filter_obj8';
import { axios_sh } from '../../../ajax/request';
import { cxfq_thrice_list , cxfq_product_list , cxfq_business_list , cxfq_thrice_deny_batch , cxfq_thrice_pass_batch , cxfq_thrice_export } from '../../../ajax/api';
import { host_cxfq , page } from '../../../ajax/config';
import { format_table_data, format_time,bmd } from '../../../ajax/tool';
import Permissions from '../../../templates/Permissions';
import ComponentRoute from '../../../templates/ComponentRoute';
import List from '../../templates/list';
import ListBtn from '../../templates/listBtn';
const status = "0,1";

class thrice_cxfq extends Component{
    constructor(props) {
        super(props);
        this.state = {
            selectedRows: [],
            loading: false,
            total:1,
            current:1,
            pageSize:page.size,
            data:[],
            model:{
                visible:false,
                loading:false,
                title:'确认通过？',
                text:'',
                approved:true,
                id:0
            },
            companys:[],
            sumSyx:0,
            sumJqx:0,
            sumCcs:0,
            sumDiscount:''
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
                title: '订单编号',
                dataIndex: 'orderNo',
            },
            {
                title: '订单时间',
                // width:160,
                dataIndex:"createTime",
                render:(data)=>{
                    return data?format_time(data):"--"
                },
                sorter: (a, b) => {
                    return bmd.getSort(a,b,"createTime")
                }
            },
            {
                title: '借款方',
                dataIndex: 'borrower',
            },
            {
                title: '车牌号',
                dataIndex: 'plateNo',
                render:data=>{
                    return data||"--"
                }
            },
            {
                title: '发动机号',
                dataIndex: 'engineNo',
            },
            {
                title: '借款金额',
                dataIndex:"loanMoney",
                render:(data)=>{
                    return data?data.money():"--"
                },
                sorter: (a, b) => {
                    return bmd.getSort(a,b,"loanMoney")
                }
            },
            {
                title: '商业险金额',
                dataIndex:"syx",
                render:(data)=>{
                    return data?data.money():"--"
                },
                sorter: (a, b) => {
                    return bmd.getSort(a,b,"syx")
                }
            },
            {
                title: '首付金额',
                dataIndex:"downPayment",
                render:(data)=>{
                    return data?data.money():"--"
                },
                sorter: (a, b) => {
                    return bmd.getSort(a,b,"downPayment")
                }
            },
            {
                title: '借款期限(月)',
                dataIndex: 'periods',
            },
            {
                title: '商户名称',
                dataIndex: 'businessName',
            },
            {
                title: '产品名称',
                dataIndex: 'productName',
            },
            {
                title: '操作',
                // fixed: 'right',
                render: (data) => {
                    var btn=[<Permissions server="bmd-chexianfenqi" tag="button" permissions={global.AUTHSERVER.cxfq.access.audit2_approve} type="primary" size="small" onClick={()=>(this.approved([data.orderNo],true)) } disabled={data.status?false:"disabled"}>通过</Permissions>,
                    <Permissions server="bmd-chexianfenqi" tag="button" permissions={global.AUTHSERVER.cxfq.access.audit2_deny} type="danger" size="small" onClick={()=>(this.approved([data.orderNo],false))}>驳回</Permissions>,
                    <Permissions size="small" permissions={global.AUTHSERVER.cxfq.access.audit2_detail} server="bmd-chexianfenqi" tag="button" onClick={()=>(this.detail(data.orderNo))}>查看</Permissions>]
                    return <ListBtn btn={btn} />;
                }
            }
        ];
        this.filter = {
            orderNo :{
                name:"订单编号",
                type:"text",
                placeHolder:"请输入订单编号"
            },
            time:{
                name:"订单时间",
                type:"range_date",
                feild_s:"startTime",
                feild_e:"endTime",
                placeHolder:['开始日期',"结束日期"]
            },
            borrower :{
                name:"借款方",
                type:"text",
                placeHolder:"请输入借款方"
            },
            insuranceNo :{
                name:"保单号",
                type:"text",
                placeHolder:"请输入保单号/投保单号"
            },
            customerType :{
                name:"业务类型",
                type:"select",
                placeHolder:"请选择",
                values:[{name:"企业",val:1},{name:"个人",val:0}]
            },
            productId :{
                name:"产品名称",
                type:"select",
                placeHolder:"请选择",
                values:'productIds'
            },
            businessName :{
                name:"商户名称",
                type:"select",
                placeHolder:"请输入商户名称",
                values:'businessIds'
            },
            carNo :{
                name:"车牌号",
                type:"text",
                placeHolder:"请输入车牌号/发动机号"
            }
        }

    }
    componentDidMount(){
        var select=window.localStorage.getItem(this.props.location.pathname);
        if(select){
            this.get_list(1,JSON.parse(select).remberData);
        }else{
            this.get_list();
        }
        this.get_select();
    }
    get_list(page_no,filter={}){
        this.setState({
            loading:true,
            selectedRowKeys:[],
            selectedRows:[]
        });
        let rqd = {
            page:1,
            page_size:page.size,
            status:status,
            ...filter
        }
        axios_sh.post(cxfq_thrice_list,rqd).then((data)=>{
            var list=data.data;
            this.setState({
                data:format_table_data(list,page_no,30),
                total:data.totalData,
                current:data.current,
                loading:false,
                sumSyx:data.sumSyx?data.sumSyx.money():0,
                sumJqx:data.sumJqx?data.sumJqx.money():0,
                sumCcs:data.sumCcs?data.sumCcs.money():0,
                sumDiscount:data.sumDiscount===null?"":data.sumDiscount
            })
        });
    }
    get_filter(data){
        this.get_list(1,data);
        this.setState({
            filter:data
        });
    }
    get_select(){
        axios_sh.get(cxfq_product_list).then(data=>{
            this.setState({
                productIds:this.filter_value(data.data)
            })
        });
        axios_sh.get(cxfq_business_list).then(data=>{
            this.setState({
                businessIds:this.filter_value(data.data)
            })
        });
    }
    filter_value(arr){
        let res = [];
        for(let a in arr){
            res.push({val:arr[a].id,name:arr[a].name})
        }
        return res;
    }
    detail(orderNo){
        window.open('/db/thrice/cxfq/detail?orderNo='+orderNo+"&audit=thrice&type=thrice");
    }
    batch_operation(pass){
        let ids = [];
        let rows = this.state.selectedRows;
        for(let r in rows){
            ids.push(rows[r].orderNo);
        }
        this.approved(ids,pass);
    }
    approved(nos,pass){
        let length = nos.length;
        if(length===0){
            message.warn("请先选择订单");
            return;
        }
        this.setState({
            model:{
                approved:pass,
                visible:true,
                title:pass?('确认所选'+length+'条订单通过？'):('确认所选'+length+'条订单驳回？'),
                text:'',
                id:nos.join(",")
            }
        })
    }
    handleOk(){
        this.approve_post(this.state.model.id,this.state.model.approved,this.state.model.text);

    }
    approve_post(orderNo,approved,comment){
        let rqd={};
        if(!approved){
            if(!comment){
                message.warn("驳回意见不能为空");
                return;
            }
        }
        rqd.orderNos=orderNo;
        rqd.comment=comment;
        this.setState({
            loading:true
        });
        let api=approved?cxfq_thrice_pass_batch:cxfq_thrice_deny_batch;
        axios_sh.post(api,rqd).then((res)=>{
            this.setState({
                loading:false
            });
            this.handleCancel();
            message.success("SUCCESS");
            this.get_list(1,this.state.filter);
        });
    }
    handleCancel(){
        this.setState({
            model:{
                approved:this.state.model.approved,
                text:this.state.model.text,
                id:this.state.model.id,
                title:this.state.model.title,
                visible:false,
                loanNotingImageStorageNoList:this.state.model.loanNotingImageStorageNoList,
                mortageImageStorageNoList:this.state.model.mortageImageStorageNoList
            }
        })
    }
    textChange(e){
        this.setState({
            model:{
                approved:this.state.model.approved,
                text:e.target.value,
                visible:this.state.model.visible,
                title:this.state.model.title,
                id:this.state.model.id,
            }
        })
    }
    page_up(page,pageSize){
        window.scrollTo(0,0);
        this.get_list(page,this.state.filter);
    }
    export_excel(){
        let url = host_cxfq + cxfq_thrice_export;
        let param = this.state.filter;
        let querys = [];
        querys.push("?status="+status)
        for(let p in param){
            querys.push(p+"="+param[p]);
        }
        window.open(url+querys.join("&"));
    }
    render (){
        let pagination = {
            total : this.state.total,
            current : this.state.current,
            pageSize : this.state.pageSize+1,
            onChange : this.page_up.bind(this),
            showTotal:total=>`共${total}条数据`

        }
        const rowSelection = {
            selectedRowKeys:this.state.selectedRowKeys,
            onChange: (selectedRowKeys, selectedRows) => {
                this.setState({ selectedRowKeys , selectedRows });
            },
            getCheckboxProps: record => ({
                disabled: record.key === '总计',
                name: record.key
            }),
        };
        const table_props = {
            rowKey:"id",
            // scroll:{ x:1700 },
            rowSelection:rowSelection,
            columns:this.columns ,
            dataSource:this.state.data,
            pagination : pagination,
            loading:this.state.loading,
        }
        const footer = [
            <Button key="back" onClick={this.handleCancel.bind(this)}>取消</Button>,
            <Button key="submit" type="primary" loading={this.state.loading_model} onClick={this.handleOk.bind(this)}>确认</Button>
        ]
        const model_props = {
            visible : this.state.model.visible,
            confirmLoading:false,
            title : this.state.model.title,
            onOk : this.handleOk.bind(this),
            onCancel : this.handleCancel.bind(this),
            loanNotingImageStorageNoList:this.state.model.loanNotingImageStorageNoList,
            mortageImageStorageNoList:this.state.model.mortageImageStorageNoList,
            footer : footer
        }
        const filter = {
            "data-get": this.get_filter.bind(this),
            "data-source": this.filter,
            "businessIds": this.state.businessIds,
            "productIds": this.state.productIds,
            "data-paths":this.props.location.pathname,
        }
        const tableTitle = {
            left: <span>
                金额单位：元 &emsp;当前查询结果商业险合计:<span className="total-bold">{this.state.sumSyx}</span>元 &emsp;交强险合计:<span className="total-bold">{this.state.sumJqx}</span>元 &emsp;车船税合计:<span className="total-bold">{this.state.sumCcs}</span>元&emsp;
                        {this.state.sumDiscount===''?'':<span>保证金合计:<span className="total-bold">{this.state.sumDiscount}</span>元</span>}
            </span>,
            right:<span>
                <Permissions server="bmd-chexianfenqi" tag="button" permissions={global.AUTHSERVER.cxfq.access.audit2_approve_batch} type="primary" onClick={(e)=>(this.batch_operation(true))}>批量通过</Permissions>&emsp;
                <Permissions server="bmd-chexianfenqi" tag="button" permissions={global.AUTHSERVER.cxfq.access.audit2_deny_batch} type="danger" onClick={(e)=>(this.batch_operation(false))}>批量驳回</Permissions>&emsp;
                <Permissions server="bmd-chexianfenqi" tag="button" permissions={global.AUTHSERVER.cxfq.access.audit2_export} type="primary" onClick={this.export_excel.bind(this)}>&emsp;导出&emsp;</Permissions>
            </span>
        }
        const modalContext=<Input placeholder="请输入审批意见" value={this.state.model.text} onChange={this.textChange.bind(this)} />
        return(
            <List filter={filter} tableInfo={table_props} tableTitle={tableTitle} modalInfo={model_props} modalContext={modalContext} />   
            // <div className="Component-body">
            //     <Filter data-get={this.get_filter.bind(this)} data-source={this.filter} businessIds={this.state.businessIds} productIds={this.state.productIds} />
            //     <Row className="table-content">
            //         <Row>
            //         <Col span={18}>
            //             <Permissions server="bmd-chexianfenqi" tag="button" roleKey="audit2" type="primary" onClick={(e)=>(this.batch_operation(true))}>批量通过</Permissions>&emsp;
            //             <Permissions server="bmd-chexianfenqi" tag="button" roleKey="audit2" type="danger" onClick={(e)=>(this.batch_operation(false))}>批量驳回</Permissions>
            //         </Col>
            //         <Col span={6} className="text-right">
            //             <Permissions server="bmd-chexianfenqi" tag="button" roleKey="export" type="primary" onClick={this.export_excel.bind(this)}>&emsp;导出&emsp;</Permissions>
            //         </Col>
            //         </Row>
            //         <div className="text-orange" style={{marginTop:"10px"}}>
            //             当前查询结果商业险合计:<span className="total-bold">{this.state.sumSyx}</span>元 &emsp;交强险合计:<span className="total-bold">{this.state.sumJqx}</span>元 &emsp;车船税合计:<span className="total-bold">{this.state.sumCcs}</span>元&emsp;
            //             {this.state.sumDiscount===''?'':<span>保证金合计:<span className="total-bold">{this.state.sumDiscount}</span>元</span>}
            //         </div>
            //         <Table {...table_props} bordered />
            //     </Row>
            //     {/* <Row className="content">
                
            //     </Row> */}
                
            //     <Modal {...model_props}>
            //         {
            //             <Input placeholder="请输入审批意见" value={this.state.model.text} onChange={this.textChange.bind(this)} />
            //         }
            //     </Modal>
            // </div>
        )
    }
}

export default ComponentRoute(thrice_cxfq);
