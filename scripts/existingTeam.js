import * as React from 'react';
import { Socket } from './Socket';

//class containing login functionality
export class ExistingTeam extends React.Component {
    constructor(props) {
        super(props);

        this.handle = this.handle.bind(this); //handles data recieved from validateCreentials
        this.validateCredentials = this.validateCredentials.bind(this); //checks team name and password with database in app.py
        this.check = this.check.bind(this);
    }
    
    //handles data recieved from validateCreentials
    handle(callback){
        var data = JSON.parse(callback);  //data = data from user if user was in database
        try{
            //sets id, name, and loggedIn props, assigned in app.py
            this.props.setProps('id', data['id']);
            this.props.setProps('name', data['name']);
            this.props.setProps('loggedIn', data['loggedIn']);
            
            //deletes access value after submission
            document.getElementById("access").value = "";
            
            //checks value of loggedIn prop to determine status of user
            switch(data['loggedIn']) {
                case "teamLead": //if teamLead or team, user goes to Play Page
                case "team":
                    document.getElementById("team_name").value == ""
                    this.props.changePage('play');
                    break;
                case "superAdmin": //if superAdmin or admin, user goes to AdminHome Page
                case "admin":
                    document.getElementById("team_name").value == ""
                    this.props.changePage('adminHome');
                    break;
                case "no": //if credentials aren't in database, user error message is shown
                    document.getElementById("errorMessage").innerHTML = "⚠ Invalid Team Name or Access Code ⚠";
                    document.getElementById("errorMessage").style.visibility = 'visible';
                    document.getElementById("errorMessage").style.color="#f2e537";
                    break;
                default:
                        break;
            } 
        }
        catch(err) {
            console.log(err);
        } 
    }
    
    //checks team name and password with database in app.py
    validateCredentials(){
        if(document.getElementById("team_name").value == "") //checks if team name input has empty value //gives error code if empty
        {
            document.getElementById("errorMessage").innerHTML = "⚠ Please Enter valid Team Name and Access Code ⚠";  //error code 
            document.getElementById("errorMessage").style.visibility = 'visible';
            document.getElementById("errorMessage").style.color="#f2e537";
        }
        else //checks if user is in database via server and if they are, retrives user data to be handled by handle(callback) function
        {
            document.getElementById("errorMessage").style.visibility = 'hidden';
            Socket.emit('validateCredentials',{'team_name':document.getElementById("team_name").value,'access':document.getElementById("access").value}, Socket.callback=this.handle);
        }
    }
    check(){
        if(document.getElementById('show').checked == true){ //show password
            document.getElementById('access').type = 'text';
        }
        else{ //hide password
            document.getElementById('access').type = 'password';
        }
    }
    render() {
        return (
            <div id='login'>
                <input type="text" id = "team_name" placeholder="Team Name" />
                <input type="password" id = "access" placeholder="Access Code" />
                <div id = "showHide"> <input type="checkbox" id = "show" onChange={this.check}/> Show Password</div>
                <div id = "errorMessage" style={{visibility:'hidden'}}> Error Message Placeholder</div>
                <div className='buttons'>
                    <button className="btn" onClick={this.validateCredentials}>Enter!</button>
                    <button className="btn" onClick={this.props.cancel}>Cancel</button>
                </div>
            </div>
        );
    }
}