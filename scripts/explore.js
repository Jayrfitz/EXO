import * as React from 'react';
import { Socket } from './Socket';
import { DropdownButton } from 'react-bootstrap';
import { MenuItem } from 'react-bootstrap';
import { LogoSmall } from './logo-small';

export class Explore extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            'policy':[],
            'choices':[],
            'sub_user':[],
            'name':[],
            'email':[],
            'subpolicy':[],
            'css':[],
            'aep':[],
            'count':2
        };
        
        this.updateExplore = this.updateExplore.bind(this); //callback function to changeType Socket //populates page with hunt information retrieved from database via app.py
        this.addQuestion = this.addQuestion.bind(this); //adds question to hunt
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
            this.state.policy = data;
            
            console.log(this.state.policy);
            
        }
    }
    
    save(){
        console.log("save");
    }
    addQuestion(){
        // Get the quiz form element
        var tb = document.getElementById('sub_user');
        var ids = document.getElementsByClassName(this.state.count - 1);
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
        console.log(tb ,"sub_user");
        console.log(filled ,"filled");
        // Good to do error checking, make sure we managed to get something
        if (tb && filled != false)
        {
                //creating elements
                var tr = document.createElement('tr');
                var td1 = document.createElement('td');
                td1.innerHTML= "Sub User ".concat((this.state.count + 1).toString());
                
                var td2 = document.createElement('td');
                sn= document.createElement('textarea');
                sn.name = 'sn';
                sn.className = this.state.count;
                sn.cols="15";
                
                var td3 = document.createElement('td');
                se= document.createElement('textarea');
                se.name = 'se';
                se.className = this.state.count;
                se.cols="15";
                
                var td4 = document.createElement('td');
                var sp= document.createElement('textarea');
                sp.name = 'sp';
                sp.className = this.state.count;
                sp.cols="15";
                
                var td5 = document.createElement('td');
                var sc= document.createElement('textarea');
                sc.name = 'sc';
                sc.className = this.state.count;
                sc.cols="13";
                
                var td6 = document.createElement('td');
                var sa= document.createElement('textarea');
                sa.name = 'sa';
                sa.className = this.state.count;
                sa.cols="13";
                
                var td7 = document.createElement('td');
                var at= document.createElement('textarea');
                at.name = 'at';
                at.className = this.state.count;
                at.cols="15";
                
                td2.appendChild(sn);
                td3.appendChild(se);
                td4.appendChild(sp);
                td5.appendChild(sc);
                td6.appendChild(sa);

                tr.appendChild(td1);
                tr.appendChild(td2);
                tr.appendChild(td3);
                tr.appendChild(td4);
                tr.appendChild(td5);
                tr.appendChild(td6);
               
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
        let n = 1;
        return (
            <div>
                <div id = 'logo-small'>
                    <LogoSmall/>
                </div>
                <div className="clear"></div>
                <div id='intro'>
                    <div className='hunt-preview'>
                        <div id='userList'>
                            <table id="admin-table2">
                                <tbody>
                                    <tr>
                                        <td><b> </b></td>
                                        <td><b>Name</b></td>
                                        <td><b>Email</b></td>
                                        <td><b>Policy</b></td>
                                        <td><b>CSS</b></td>
                                        <td><b>AEP</b></td>
                                    </tr>
                                    <tr>
                                        <td>Primary User</td>
                                        <td><textarea name='pn' className={n} cols='15'></textarea></td>
                                        <td><textarea name='pe' className={n} cols='15'></textarea></td>
                                        <td><textarea name='pp' className={n} cols='15'></textarea></td>
                                        <td><textarea name='pc' className={n} cols='13'></textarea></td>
                                        <td><textarea name='pa' className={n} cols='13'></textarea></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div id='userList'>
                            <table id="admin-table2">
                                <tbody id="sub_user">
                                </tbody>
                            </table>
                        </div>
                        <div className='buttons'>
                            <button className="btn" onClick={this.addQuestion}>Add Sub User</button>   
                            <button className="btn" onClick={this.save}>Save Users</button>  
                        </div>
                        <button className='btn' onClick={() => this.changePageWithNumPolicies('register',this.state.count+1)}>Register</button>
                    </div>
                    <div>
                        <button className='btn' onClick={() => this.props.changePage('home')}>Home</button>
                    </div>
                </div>
            </div>
        );
    }
}
