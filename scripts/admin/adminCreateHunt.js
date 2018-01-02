import * as React from 'react';
import { Socket } from '../Socket';

import moment from 'moment';

import DayPickerInput from 'react-day-picker/DayPickerInput';
import 'react-day-picker/lib/style.css';


export class AdminCreateHunt extends React.Component {
        constructor(props) {
        super(props);
        this.state = {
            'count':2,
            'limit':36,
            'questions':[],
            'answers':[],
            'images':[],
            'hint1':[],
            'hint2':[],
            'answer_text':[]
        };
        
        this.addQuestion = this.addQuestion.bind(this); //adds question to hunt
        this.save = this.save.bind(this); //saves hunt and questions to database
    }

    save() {
        var filled = true;
        var n = document.getElementById("n").value;
        var t = document.getElementById("t").value;
        var u = document.getElementById("u").value;
        var d = document.getElementById("d").value;
        var s = document.getElementById("s").value;
        var e = document.getElementById("e").value;
        var st = document.getElementById("st").value;
        if(n == '' || t == '' || u == '' || d == '' || s== '' || e == ''){
            filled = false;
        }
    
        var Qfilled = true;
        for(var w = 1; w <= this.state.count; w++){
            // Get the quiz form element
            var ids = document.getElementsByClassName(w);
            var q = document.getElementsByName("q");
            var a = document.getElementsByName("a");
            var i = document.getElementsByName("i");
            var h1 = document.getElementsByName("h1");
            var h2 = document.getElementsByName("h2");
            var at = document.getElementsByName("at");
    
            for(var m = 0; m < ids.length; m++){
                for(var j = 0; j < q.length; j++){
                    if(ids[m].value == q[j].value){
                        q = q[j].value;
                        a = a[j].value;
                        j = ids.length;
                        if(q == '' || a == ''){
                            Qfilled = false;
                        }
                    }
                }
            }
        }
        if(Qfilled && filled){
            for(var z = 0; z < q.length; z++){
                this.state.questions[z]= q[z].value;
                this.state.answers[z]= a[z].value;
                this.state.answer_text[z]= at[z].value;
                this.state.hint1[z]= h1[z].value;
                this.state.hint2[z]= h2[z].value;
                this.state.images[z] = i[z].value;
            }
            	Socket.emit('createHunt',{
                    'name':n,
                    'sDate':s,
                    'eDate':e,
                    'url':u,
                    'type':t.toLowerCase(),
                    'desc':d,
                    'st':st,
                    
                    'question':this.state.questions,
                    'answer':this.state.answers,
                    'answer_text':this.state.answer_text,
                    'hint1':this.state.hint1,
                    'hint2':this.state.hint2,
                    'image':this.state.images
            	});
            	this.props.changePage('adminHunts')
        }
        else{
            alert("Please check that all pri requirements are filled");
        }
    }
    
    addQuestion(){
        // Get the quiz form element
        var tb = document.getElementById('questions');
        var ids = document.getElementsByClassName(this.state.count - 1);
        var q = document.getElementsByName("q");
        var a = document.getElementsByName("a");

        var filled = true;
        for(var m = 0; m < ids.length; m++){
            for(var j = 0; j < q.length; j++){
                if(ids[m].value == q[j].value){
                    q = q[j].value;
                    a = a[j].value;
                    j = ids.length;
                    if(q == '' || a == ''){
                        filled = false;
                    }
                }
            }
        }
    
        // Good to do error checking, make sure we managed to get something
        if (tb && filled != false)
        {
            if (this.state.count < this.state.limit)
            {
                //creating elements
                var tr = document.createElement('tr');
                var td1 = document.createElement('td');
                td1.innerHTML= this.state.count;
                
                var td2 = document.createElement('td');
                q= document.createElement('textarea');
                q.name = 'q';
                q.className = this.state.count;
                q.placeholder="(required)";
                q.cols="15";
                
                var td3 = document.createElement('td');
                a= document.createElement('textarea');
                a.name = 'a';
                a.className = this.state.count;
                a.placeholder="(required)";
                a.cols="15";
                
                var td4 = document.createElement('td');
                var i= document.createElement('textarea');
                i.name = 'i';
                i.className = this.state.count;
                i.cols="15";
                
                var td5 = document.createElement('td');
                var h1= document.createElement('textarea');
                h1.name = 'h1';
                h1.className = this.state.count;
                h1.cols="13";
                
                var td6 = document.createElement('td');
                var h2= document.createElement('textarea');
                h2.name = 'h2';
                h2.className = this.state.count;
                h2.cols="13";
                
                var td7 = document.createElement('td');
                var at= document.createElement('textarea');
                at.name = 'at';
                at.className = this.state.count;
                at.cols="15";
                
                td2.appendChild(q);
                td3.appendChild(a);
                td4.appendChild(i);
                td5.appendChild(h1);
                td6.appendChild(h2);
                td7.appendChild(at);

                tr.appendChild(td1);
                tr.appendChild(td2);
                tr.appendChild(td3);
                tr.appendChild(td4);
                tr.appendChild(td5);
                tr.appendChild(td6);
                tr.appendChild(td7);
                
                tb.appendChild(tr);
                
                this.setState({
                    'count': this.state.count + 1
                }); 
            }
            else   
            {
                alert('Question limit reached');
            }
        }
        else{
            alert("Please check that all sub requirements are filled");
        }
    }

    render() {
        let n = 1;
        return (
            <div >
                <div id = 'header'>
                    <header>Create Hunt</header>
                </div>
                <div id='userList2'>
                    <table id="admin-table2">
                        <tbody>
                            <tr>
                                <td><b>Name</b></td>
                                <td><b>Hunt Type</b></td>
                                <td><b>Description</b></td>
                                <td><b>Image</b></td>
                                <td><b>Start time</b></td>
                                <td><b>End time</b> </td>
                                <td><b>Start text</b></td>
                                </tr>
                            <tr>
                                <td><textarea id='n' className='create-item' cols='10' placeholder="(required)"></textarea></td>
                                <td><textarea id='t' className='create-item' cols='5' rows='1' placeholder="(required)"></textarea></td>
                                <td><textarea id='d' className='create-item' cols='15' placeholder="(required)"></textarea></td>
                                <td><textarea id='u' className='create-item' cols='15' placeholder="(required)"></textarea></td>
                                <td><DayPickerInput id='s' className='create-item' cols='17' cols='17' rows='1'placeholder='(mm/dd/YYYY)'/></td>
                                <td><DayPickerInput id='e' className='create-item' cols='17' rows='1' placeholder='(mm/dd/YYYY)'/></td>
                                <td><textarea id='st' className='create-item' cols='15' ></textarea></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className='buttons'>
                        <button className="btn" onClick={this.addQuestion}>Add Question</button>   
                        <button className="btn" onClick={this.save}>Save Hunt</button>  
                </div>
                <div id='userList'>
                    <table id="admin-table2">
                        <tbody>
                            <tr>
                                <td><b>#</b></td>
                                <td><b>Question</b></td>
                                <td><b>Answer</b></td>
                                <td><b>Image</b></td>
                                <td><b>Hint One</b></td>
                                <td><b>Hint Two</b></td>
                                <td><b>Answer Text</b> </td>
                                </tr>
                            <tr>
                                <td>1</td>
                                <td><textarea name='q' className={n} cols='15' placeholder="(required)"></textarea></td>
                                <td><textarea name='a' className={n} cols='15'placeholder="(required)"></textarea></td>
                                <td><textarea name='i' className={n} cols='15'></textarea></td>
                                <td><textarea name='h1' className={n} cols='13'></textarea></td>
                                <td><textarea name='h2' className={n} cols='13'></textarea></td>
                                <td><textarea name='at' className={n} cols='15'></textarea></td>
                            </tr>
                        </tbody>
                        <tbody id="questions">
                        </tbody>
                    </table>
                </div>
            </div>
         
        );
    }
}