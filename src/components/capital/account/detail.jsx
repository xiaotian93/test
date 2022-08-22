import React, { Component } from 'react';
import Total from '../total/total';
import ComponentRoute from '../../../templates/ComponentRoute';

class Detail extends Component {
    render() {
        return <Total accountId={this.props.location.query.accountId} />
    }
}


export default ComponentRoute(Detail);