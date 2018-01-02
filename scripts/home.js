import * as React from 'react';
import { ExistingTeam } from './existingTeam';

//homepage of website, contains existingTeams class
export class Home extends React.Component {
    constructor(props) {
        super(props);
        this.login = this.login.bind(this); //sets visibility of exisitingTeams class to 'block' and allows user to enter login credentials
    }
    //sets visibility of exisitingTeams class to 'block' and allows user to enter login credentials
    login(){
        if (document.getElementById("existingTeam").style.display == "none"){
            document.getElementById("existingTeam").style.display = "block";
            document.getElementById("nav").style.display = "none";
        }
        else{
            document.getElementById("existingTeam").style.display = "none";
            document.getElementById("nav").style.display = "block";
        }
    }
    
    render() {
        return (
            <div>
                <div id='front-header'>
                    <img id="logo-big" src="../static/image/logo-big.png"/>
                </div>
                <div id='intro'>
                   <div id="slideshow">
                        <div className='helper'></div><img id="ss-image" src="../static/image/gallery/boats.jpg"/>
                    </div>
                    <div className='buttons'>
                        <div className ="tool">
                            <div id="nav">
                                <button className="btn" onClick={() => this.props.changePage('explore')}>Exlore Policy Options</button>
                                <button className="btn" onClick={this.login}>Login</button>
                            </div>
                            <div id = 'existingTeam' style={{display:'none'}}>
                            	<ExistingTeam changePage={this.props.changePage} cancel={this.login} setProps={this.props.setProps} loggedIn={this.props.loggedIn}/>
                            </div>
                        </div>
                    </div>
                    
                </div>
            </div>

        );
    }
}