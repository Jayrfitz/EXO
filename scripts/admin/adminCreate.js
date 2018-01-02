import * as React from 'react';
import * as ReactBootstrap from 'react-bootstrap';
import { Socket } from '../Socket';
import { Button } from 'react-bootstrap';
import { InputGroup } from 'react-bootstrap';
import { FormGroup } from 'react-bootstrap';
import { ButtonToolbar } from 'react-bootstrap';
import { FormControl } from 'react-bootstrap';

export class AdminCreate extends React.Component {
        constructor(props) {
        super(props);
        
        this.handleSubmit = this.handleSubmit.bind(this);
        this.pageName = 'adminCreate';
        this.addAdmin = this.addAdmin.bind(this);
        this.check = this.check.bind(this);
    }

    handleSubmit(event) {
        event.preventDefault();
        
    }
    
    addAdmin(){
        Socket.emit('addAdmin', {'email':document.getElementById('create_email').value, 
                                'team_name':document.getElementById('create_team_name').value,
                                'access_code':document.getElementById('create_access_code').value,
                                'is_super':document.getElementById('is_super').value});
        this.props.changePage('admins')
    }
    check(){
        if(document.getElementById('show').checked == true){ //show password
            document.getElementById('create_access_code').type = 'text';
        }
        else{ //hide password
            document.getElementById('create_access_code').type = 'password';
        }
    }
    render() {
        return (
            <div>
                <div id = 'header'>
                    <header>Create Admin</header>
                </div>
                <div id='intro'>
                        <form id='create-form'>
                            <FormGroup>
                                <InputGroup>
                                    <FormControl id='create_email' type="text" placeholder="Email" /><br/>
                                    <FormControl id='create_team_name' type="text" placeholder="Username" /><br/>
                                    <FormControl id='create_access_code' type="password" placeholder="Access Code" /><br/>
                                    <FormControl id='is_super' type="text" placeholder="Super Admin?(T/F)" />
                                    
                                    <input type="checkbox" id = "show" onChange={this.check}/> Show Password
                                </InputGroup>
                            </FormGroup>
                        </form>
                        <div className='buttons'>
                            <form onSubmit = {this.handleSubmit}>
                                <FormGroup>
                                    <InputGroup>
                                        <ButtonToolbar>
                                            <Button id='add-admin' onClick={this.addAdmin}>Add Admin</Button>
                                        </ButtonToolbar>
                                    </InputGroup>
                                </FormGroup>
                            </form>
                        </div>
                    </div>
                
            </div>
         
        );
    }
}