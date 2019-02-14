import "asset/css/global.less";
import React from "react";
import {connect, DispatchProp} from "react-redux";
import {RootState} from "type/state";
import {Switch} from "react-router-dom";
import MainLayout from "./MainLayout";
import Route from "framework/components/Route";
import "./index.less";

interface StateProps {
    name: string;
}

interface Props extends StateProps, DispatchProp {}
class Component extends React.PureComponent<Props> {
    render() {
        const {dispatch} = this.props;
        return (
            <div className="main-container g-full-screen g-no-scroll">
                <Switch>
                    <Route path="/register" />
                    <Route component={MainLayout} />
                </Switch>
            </div>
        );
    }
}

const mapStateToProps = (state: RootState): StateProps => {
    return {
        name: state.app.main.name,
    };
};

export default connect(mapStateToProps)(Component);
