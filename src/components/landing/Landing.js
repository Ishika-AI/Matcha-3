import React from 'react';
import { Link , Redirect, withRouter} from 'react-router-dom';
import LoginForm from './LoginForm';
import Modal from '../shared/modal/Modal';
import RegisterForm from './RegisterForm';
import { connect } from 'react-redux';
import * as actions from 'actions';

export class Landing extends React.Component {
    
    constructor() {
        super();
        this.state = {
            isSignIn: false,
            isSignUp: false,
            errors:[],
            redirect: false,
            success: [],
            show:false,
        }
        this.logInUser = this.logInUser.bind(this);
        this.registerUser = this.registerUser.bind(this);
        this.showModal = this.showModal.bind(this);
        this.hideModal = this.hideModal.bind(this);
    }

    showModal(formType) {
        this.setState({ show: true });
        {formType == "signIn" ? this.setState({isSignIn: true }) : this.setState({isSignUp: true }); } 
    }
    
    hideModal(event) {
        if(event.target.id.includes('closeModal') ||event.target.nodeName == 'path' || event.target.nodeName =='svg')
        {
            this.setState({
                show: false ,
                isSignIn: false,
                isSignUp: false,
                errors:[],
            })

        }
    }

    registerUser(userData){
        actions.register(userData).then(
            (registered) => this.setState({isSignIn: true, success: "Welcome to Matcha !"}),
            (errors) => this.setState({errors})
        );
    }
    
    logInUser(userData){
        this.props.dispatch(actions.login(userData));
    }

    render() {
        const { isAuth, errors} = this.props.auth;
        const { successRegister } = this.props.location.state || false;
        
        // const { redirect } = this.state;
        
        // if (redirect){
        //     return <Redirect to={{pathname: '/dashboard', state: { isSignIn: true, redirect:false}}} />
        //     // return 
        // }

        if (isAuth){
            return <Redirect to={{pathname: '/dashboard'}} />
        }

        return (
            
            <div className="landing-body">
               <div className="landing-shade">
                </div>
                <nav className="nav">
                    <div className="button cl-org" onClick={() => { this.showModal('signIn')}}>SIGN IN</div>  
                </nav>
                {/* <div className="card text-white landing-content mb-3" >
                </div>*/}
                <div className="landing-content">
                    <h1>Match me if you can...</h1>
                    <div className="button sign_up full" onClick={() => { this.showModal('signUp')}}>Sign up</div>
                </div>

               { this.state.isSignIn ? <Modal show={this.state.show} handleClose={this.hideModal} children={<LoginForm submitCb={this.logInUser} errors={errors} success={this.state.success} />} modalType={"form"}/> : "" } 
               { this.state.isSignUp ? <Modal show={this.state.show} handleClose={this.hideModal} children={<RegisterForm submitCb={this.registerUser} errors={errors}  />}  modalType={"form"} /> : "" } 
            </div>
            
        )
    }
}


function mapStateToProps(state){
    return {
        auth: state.auth
    }
}
export default connect(mapStateToProps)(Landing);