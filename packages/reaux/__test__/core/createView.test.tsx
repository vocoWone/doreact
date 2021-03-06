import React from "react";
import {createAction} from "../../src/core/createAction";
import {createStore} from "redux";
import {createReducer, createModuleReducer} from "../../src/core/createReducer";
import {createApp} from "../../src/core/createApp";
import {viewInjection, createView} from "../../src/core/createView";
import {App} from "../../src/type";
import renderer from "react-test-renderer";

test("Create Component View", () => {
    const store = createStore(
        createReducer({
            main: createModuleReducer("main"),
            main2: createModuleReducer("main2"),
        })
    );
    const app: App = createApp(store);
    viewInjection(app);

    class Model {
        moduleName: string;
        initState: any;
        state: any;
        rootState: any;
        setState: any;
        restState: any;
        constructor(moduleName: string, state: any) {
            this.moduleName = moduleName;
            this.state = state;
        }
        onReady() {}
        onLoad() {}
        onUnload() {}
        onHide() {}
    }
    const handler = new Model("module", {});
    class DIV extends React.PureComponent {
        render() {
            return <div>text</div>;
        }
    }
    class Component extends React.PureComponent<any, any> {
        constructor(props: any) {
            super(props);
            this.state = {toggle: false};
        }

        onToggle = () => this.setState({toggle: !this.state.toggle});

        render() {
            return (
                <div onClick={this.onToggle} {...this.props}>
                    {this.state.toggle ? "toggle component" : "component"}
                    <DIV />
                </div>
            );
        }
    }
    const {actions} = createAction(handler);
    const NewComponent = createView(handler, actions, Component);
    /* 
        Error: [test-renderer] Cannot read property `current` of undefined
        ref: https://github.com/facebook/react/issues/16323
        react and react-test-renderer must be same version
     */
    const newComponent = renderer.create(<NewComponent name="name" age={18} />);
    let tree = newComponent.toJSON()!;
    const newDIV = renderer.create(<DIV />);
    let divTree = newDIV.toJSON()!;
    expect(tree).toMatchSnapshot();
    expect(tree.type).toBe("div");
    expect(tree.children).toEqual(["component", divTree]);
    // TODO: Why not {name:"name", age:18 }
    expect(JSON.stringify(tree.props)).toEqual(JSON.stringify({name: "name", age: 18, onClick: () => {}}));

    // manually trigger the callback
    tree.props.onClick();
    // re-rendering
    tree = newComponent.toJSON()!;
    expect(tree).toMatchSnapshot();

    newComponent.update(<NewComponent />);
    newComponent.unmount();
});
