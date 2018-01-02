import * as React from 'react';
import { Socket } from '../Socket';


export class AdminHome extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            admin: {'id':0, 'email': "", 'username':"", 'is_super':false},
        };
        
        this.handleSubmit = this.handleSubmit.bind(this);
        this.loadAdmin = this.loadAdmin.bind(this);
    }

    handleSubmit(event) {
        event.preventDefault();
    }
    
    componentDidMount(){
        Socket.on('updateAdminHome', (data) => { 
            Socket.emit('loadAdmin', this.props.state.id, Socket.callback=this.loadAdmin);
        });
    }
    loadAdmin(data){
        data = JSON.parse(data);
        this.setState({
            admin: data[0]
        });
    }
    
    render() {
        let name = this.state.admin.username;
        return (
            <div>
                <div id = 'header'>
                    <header>Welcome, {name}!</header>
                </div>
                <div id='intro'>
                </div>
            </div>
         
        );
    }
}