import * as React from 'react';
import { Socket } from './Socket';
import { DropdownButton } from 'react-bootstrap';
import { MenuItem } from 'react-bootstrap';
import { LogoSmall } from './logo-small';

export class Explore extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            'primary':[],
            'first_name':[],
            'last_name':[],
            'email':[],
            'password':[],
            'policies':[],
            'coverage':[],
            'coverageId':[],
            'coverageDesc':[],
            'devices':[],
            'count':1
        };
        
        this.updateExplore = this.updateExplore.bind(this); //callback function to changeType Socket //populates page with hunt information retrieved from database via app.py
        this.addUser = this.addUser.bind(this); //adds question to hunt
        this.save = this.save.bind(this); //saves hunt and questions to database
        this.changePageWithNumPolicies = this.changePageWithNumPolicies.bind(this);//changes page to register with number of policies
    }
    
    componentDidMount() {
        //updates explore page with hunt information
        Socket.on('updateExplore', (data) => {
            Socket.emit('changeType',1, Socket.callback=this.updateExplore);
        });
    }
    changePageWithNumPolicies(page, numPolicies){
        this.props.setProps('select',numPolicies);
        this.props.changePage(page);
    }
    
    //callback function to changeType Socket //populates page with hunt information retrieved from database via app.py
    updateExplore(callback){
        this.setState({'count':0});
        if(callback == 'empty'){
            console.log('NO POLICIES');
        }
        else{ 
            var data = JSON.parse(callback);
            var policies = data['policies'];
            this.state.policies = policies;
            for(var i = 0; i < policies.length; i++) {
                this.state.coverage[i] = policies[i]['policy_color'];
                this.state.coverageId[i] = policies[i]['id'];
                this.state.coverageDesc[i] = policies[i]['desc'];
            }
        }
        this.addUser();
    }
    
    save(){
        console.log("save");
    }
    addUser(){
        // Get the quiz form element
        var tb = document.getElementById('sub_user');
        var ids = document.getElementsByClassName(this.state.count);
        var sn = document.getElementsByName("sn");
        var se = document.getElementsByName("se");

        var filled = true;
        for(var m = 0; m < ids.length; m++){
            for(var j = 0; j < sn.length; j++){
                if(ids[m].value == sn[j].value){
                    sn = sn[j].value;
                    se = se[j].value;
                    j = ids.length;
                    if(sn == '' || se == ''){
                        filled = false;
                    }
                }
            }
        }

        // Good to do error checking, make sure we managed to get something
        if (tb && filled != false)
        {
                //creating elements
                var tr = document.createElement('tr');
                var td1 = document.createElement('td');
                td1.innerHTML = "User ".concat((this.state.count + 1).toString());
                
                var td2 = document.createElement('td');
                var primary = document.createElement('input');
                primary.type = 'checkbox';
                primary.name = 'primary';
                primary.className = this.state.count;
                primary.cols="15";
                
                var td3 = document.createElement('td');
                var first_name= document.createElement('textarea');
                first_name.name = 'first_name';
                first_name.className = this.state.count;
                first_name.cols="15";
                
                var td4 = document.createElement('td');
                var last_name = document.createElement('textarea');
                last_name.name = 'last_name';
                last_name.className = this.state.count;
                last_name.cols="15";
                
                var td5 = document.createElement('td');
                var email = document.createElement('textarea');
                email.name = 'email';
                email.className = this.state.count;
                email.cols="15";
                
                var td6 = document.createElement('td');
                var password = document.createElement('textarea');
                password.name = 'password';
                password.className = this.state.count;
                password.cols="15";
                
                var td7 = document.createElement('td');
                var coverage = document.createElement('select');
                coverage.name = 'coverage';
                coverage.className = this.state.count;
                coverage.cols="15";
                
                
                
                for (var i = 0; i < this.state.policies.length; i++) {
                    
                    var option = document.createElement("option");
                    option.value = this.state.coverageId[i];
                    option.text = this.state.coverage[i];
                    coverage.appendChild(option);
                    
                }
                
                var td8 = document.createElement('td');
                var devices= document.createElement('input');
                devices.style.width = '40px';
                devices.type = 'number';
                devices.name = 'devices';
                devices.className = this.state.count;
                devices.cols ='3';
            
                
                td2.appendChild(primary);
                td3.appendChild(first_name);
                td4.appendChild(last_name);
                td5.appendChild(email);
                td6.appendChild(password);
                td7.appendChild(coverage);
                td8.appendChild(devices);
                
                tr.appendChild(td1);
                tr.appendChild(td2);
                tr.appendChild(td3);
                tr.appendChild(td4);
                tr.appendChild(td5);
                tr.appendChild(td6);
                tr.appendChild(td7);
                tr.appendChild(td8);
           
               
                tb.appendChild(tr);
                
                this.setState({
                    'count': this.state.count + 1
                });
        }
        else{
            alert("Please check that all requirements are filled");
        }
    }
    
    render() {
        return (
            <div>
                <div id = 'logo-small'>
                    <LogoSmall/>
                </div>
                <div id='intro'>
                    <div id='userList'>
                        <table id="admin-table2">
                            <tbody id="sub_user">
                                <tr>
                                    <td><b> </b></td >
                                    <td><b>Primary</b></td>
                                    <td><b>First Name</b></td>
                                    <td><b>Last Name</b></td>
                                    <td><b>Email</b></td>
                                    <td><b>Password</b></td>
                                    <td><b>Coverage</b></td>
                                    <td><b>Devices</b></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className='buttons'>
                        <button className="btn" onClick={this.addUser}>Add User</button>   
                        <button className="btn" onClick={this.save}>Save Users</button>  
                    </div>
                    <button className='btn' onClick={() => this.changePageWithNumPolicies('register',this.state.count+1)}>Register</button>
                    <button className='btn' onClick={() => this.props.changePage('home')}>Home</button>
                </div>
            </div>
        );
    }
}
