import * as React from 'react';
import * as ReactBootstrap from 'react-bootstrap';
import { Socket } from '../Socket';
import { Button } from 'react-bootstrap';
import { InputGroup } from 'react-bootstrap';
import { FormControl } from 'react-bootstrap';
import { FormGroup } from 'react-bootstrap';
import { ButtonToolbar } from 'react-bootstrap';
import { ButtonGroup } from 'react-bootstrap';
import { Checkbox } from 'react-bootstrap';


export class Admins extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            'getAdmin': [],
            'superCount': 0
        };
        this.pageName = 'admins';
        this.handleSubmit = this.handleSubmit.bind(this);
        this.deleteAdmin = this.deleteAdmin.bind(this);
        this.updateAdmin = this.updateAdmin.bind(this);
        this.loadAdmins = this.loadAdmins.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
    }

    handleSubmit(event) {
        event.preventDefault();

    }
    componentDidMount(){
        Socket.on('callbackUpdateAdmin', (data) => {
            
            Socket.emit('loadAllAdmins', this.props.state.id, Socket.callback = this.loadAdmins);
        });
    }
    deleteAdmin(index, username){

        if(this.props.state.id != index && confirm("Are you sure you would like to delete admin?") == true){
            alert("Admin Deleted");
            Socket.emit('deleteAdminFace', index, Socket.callback = this.handleDelete);
        }
        else if (this.props.state.id == index){
            alert("Cannot Delete Self");
        }
        else {
            alert("Admin Not Deleted");
        }
    }
    handleDelete(callback){
        Socket.emit('loadAllAdmins', this.props.state.id, Socket.callback = this.loadAdmins);
    }
    loadAdmins(callback){
        var data = JSON.parse(callback);
        this.setState({
            'getAdmin': data['adminList'],
            'superCount': data['count']
        }); 
    }
    
    updateAdmin(id, username, email,is_super){
        var email1 = prompt('email', email);
        var username1 = prompt('username', username);
        var is_super1 = prompt('super(True/False)',is_super);
        if(email1 == null){
            email1 = email; 
        }
        if(username1 == null){
            username1 = username; 
        }
        if(is_super1 == null){
            is_super1 = is_super; 
        }
        
        var admin = {
            'id':id,
            'username':username1,
            'email':email1,
            'is_super':is_super1
        };
        var confirmTxt = "Are you sure you would like to make the following changes to " + username + "?" + 
        "\nEmail: " + email1 + 
        "\nUsername: " + username1 + 
        "\nIs Super: " + is_super1;
        if(confirm(confirmTxt) == true){
            if (this.state.superCount <= 1 && (is_super == 'true' || is_super) && (is_super1 == 'false' || !is_super1)){
                alert("Admin Not Updated: Must have at least one Super Admin");
            }
            else{
                Socket.emit('updateAdmin', admin);
                if (id == this.props.state.id && (is_super1 == 'false' || !is_super1)){
                    this.handleDelete(0); //update super count
                    this.props.logOutSetProps();
                    alert("Admin Updated: You've been logged out due to permission changes.");
                }
                else{
                    alert("Admin Updated");
                }
            }
        }
        else {
            alert("Admin Not Updated");
        }
    }
    
    render() {
        var admins = '';
        
        if (this.state.getAdmin != null) {
            admins = this.state.getAdmin.map(
                (n, index) =>
                <tr key={index}>
                <td>{n.email}</td>
                <td>{n.username}</td>
                <td>{n.is_super.toString()}</td>
                <td><Button onClick={() => this.updateAdmin(n.id, n.username,n.email, n.is_super)}>Update</Button></td>
                <td><Button onClick={() => this.deleteAdmin(n.id, n.username)}>Delete</Button></td>
                </tr>
             );
        }

        return (
            <div>
                <div id = 'header'>
                    <header>Administrators</header>
                </div>
                <div id='intro'>
                    <p id="deleted"></p><br/>
                </div>
                <div id="userList">
                    <table id="admin-table2">
                        <tbody>
                            <tr>
                                <td>Email</td>
                                <td>Username</td>
                                <td>Super</td>
                                <td>Update</td>
                                <td>Delete</td>
                            </tr>
                            {admins}
                        </tbody>
                    </table>
                </div>
                <div className='buttons'>
                    <form onSubmit = {this.handleSubmit}>
                        <FormGroup>
                            <InputGroup>
                                <ButtonToolbar>
                                    <Button onClick={() => this.props.changePage('adminCreate')}>Create New Admin</Button>
                                </ButtonToolbar>
                            </InputGroup>
                        </FormGroup>
                    </form>
                </div>
            </div>

        );
    }
}
