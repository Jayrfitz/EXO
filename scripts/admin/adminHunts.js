import * as React from 'react';
import { Socket } from '../Socket';
import { Button } from 'react-bootstrap';
import { InputGroup } from 'react-bootstrap';
import { FormGroup } from 'react-bootstrap';
import { ButtonToolbar } from 'react-bootstrap';

export class AdminHunts extends React.Component {
        constructor(props) {
        super(props);
        this.state = {
            'getHunts': [],
            'getQuestions': []
        };
        this.pageName = 'adminHunts';
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handle = this.handle.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.handleDeleteQ = this.handleDeleteQ.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.showQuestions = this.showQuestions.bind(this);
        this.updateHunts = this.updateHunts.bind(this);
        this.deleteHunt = this.deleteHunt.bind(this);
        
        this.updateQuestion = this.updateQuestion.bind(this);
        this.deleteQuestion = this.deleteQuestion.bind(this);
        this.change = this.change.bind(this);
        
        
    }

    handleSubmit(event) {
        event.preventDefault();
    }
    
    componentDidMount(){
        Socket.on('getHunts', (data) => {
            this.setState({
                'getHunts': data['getHunts']
            });
        });
        
    }
    showQuestions(index){
        Socket.emit('questionsCall', {'index':index});
        
        
        Socket.on('getQuestions', (data) => {
            this.setState({
                'getQuestions': data['getQuestions']
            });
        });
    }
    
    updateHunts(id){
        var ids = document.getElementsByClassName(id);
        var n = document.getElementsByName("n");
        var t = document.getElementsByName("t");
        var u = document.getElementsByName("u");
        var d = document.getElementsByName("d");
        var s = document.getElementsByName("s");
        var e = document.getElementsByName("e");
        var st = document.getElementsByName("st");

        for(var m = 0; m < ids.length; m++){
            for(var j = 0; j < n.length; j++){
                if(ids[m].value == n[j].value){
                    n = n[j].value;
                    t = t[j].value.toLowerCase();
                    u = u[j].value;
                    d = d[j].value;
                    s = s[j].value;
                    e = e[j].value;
                    st = st[j].value;
                    j = ids.length;
                }
            }
        }
        
        if(confirm("Would you like to make the following changes to the " + n + " hunt ?\n\n" + 
        "Name: " + n +
        "\nType: " + t + 
        "\nImage: " + u + 
        "\nDescription: " + d+
        "\nStart Time: " + s + 
        "\nEnd Time: " + e+ 
        "\nStart Text: " + st
        )){
            var data = {
            'id': id,
            'name': n,
            'type': t,
            'image': u, 
            'desc': d,
            'start_time': s,
            'end_time': e,
            'start_text': st
            };
            Socket.emit('updateHunt', data, Socket.callback=this.handle);
        }
    }
    
    deleteHunt(hunts_id, name){
        this.setState({
            'getQuestions': null
        });
        if(confirm("Will delete all Participants and Questions in hunt " + (name) +"!\n\n" ))
        {
            Socket.emit('deleteHunt', hunts_id, Socket.callback=this.handleDelete);
        }
    }
    handle(callback){
        alert("Update Complete");
    }
    handleDelete(callback){
        alert("Delete Complete");
        Socket.emit('adminHunts', "Hunt");
    }
    
    updateQuestion(id,question,answer,image,hint_A,hint_B,answer_text,hunts_id){
        var ids = document.getElementsByClassName(id);
        var q = document.getElementsByName("q");
        var a = document.getElementsByName("a");
        var i = document.getElementsByName("i");
        var h1 = document.getElementsByName("h1");
        var h2 = document.getElementsByName("h2");
        var at = document.getElementsByName("at");

        for(var m = 0; m < ids.length; m++){
            for(var j = 0; j < q.length; j++){
                if(ids[m].value == q[j].value && q[j].value != ''){
                    q = q[j].value;
                    a = a[j].value;
                    i = i[j].value;
                    h1 = h1[j].value;
                    h2 = h2[j].value;
                    at = at[j].value;
                    m = ids.length;
                    j = q.length;
                }
            }
        }
        
        
        if(confirm("Would you like to make the following changes to this Question?\n\n" + 
        "Question: " + q +
        "\nAnswer: " + a + 
        "\nImage: " + i + 
        "\nHint One: " + h1 + 
        "\nHint One: " + h2 + 
        "\nAnswer Text: " + at
        )){
            if (question != null && question != "" && answer != null && answer != "") {
                var data = {
                    'id': id,
                    'question': q,
                    'answer': a,
                    'image': i, 
                    'h1': h1,
                    'h2': h2,
                    'answer_text': at
                };
                Socket.emit('updateQuestion', data);
            }
            else{
                alert('not updated no blank entries for question, answer, or hint_A');
            }
        }
    }
    
    deleteQuestion(id){
        Socket.emit('deleteQuestion', id, Socket.callback=this.handleDeleteQ);
    }
    
    handleDeleteQ(callback){
        alert("Delete Complete");
        Socket.emit('questionsCall', {'index':callback});
        
        
        Socket.on('getQuestions', (data) => {
            this.setState({
                'getQuestions': data['getQuestions']
            });
        });
    }
    change(){
        this.setState({
            'getQuestions': null
        });
        this.props.changePage('adminCreateHunt');
    }

    
    render() {
        var hunts = '';
        var questions = '';
        
        if (this.state.getHunts != null) {
            
            hunts = this.state.getHunts.map(
                (n, index) =>
                <tr key={index}>
                <td><textarea className={n.id} name='n' cols='10' defaultValue={n.name}></textarea></td>
                <td><textarea className={n.id} name='t' cols='5' rows='1' defaultValue={n.h_type}></textarea></td>
                <td><textarea className={n.id} name='d' cols='15' defaultValue={n.desc}></textarea></td>
                <td><textarea className={n.id} name='u' cols='15' defaultValue={n.image}></textarea></td>
                <td><textarea className={n.id} name='s' cols='9' rows='1'defaultValue={n.start_time}></textarea></td>
                <td><textarea className={n.id} name='e' cols='9' rows='1' defaultValue={n.end_time}></textarea></td>
                <td><textarea className={n.id} name='st' cols='15'defaultValue={n.start_text}></textarea></td>
                <td><Button onClick={() => this.showQuestions(n.id)}>Questions</Button></td>
                <td><Button onClick={() => this.updateHunts(n.id)}>Update</Button></td>
                <td><Button onClick={() => this.deleteHunt(n.id, n.name)}>Delete</Button></td>
                </tr>
             );
        }
        
        if (this.state.getQuestions != null) {
            questions = this.state.getQuestions.map(
                (n, index) =>
                <tr key={0} id = "titles">
                <td><b>Question</b></td>
                <td><b>Answer</b></td>
                <td><b>Image</b></td>
                <td><b>Hint 1</b></td>
                <td><b>Hint 2</b></td>
                <td><b>Answer Text</b></td>
                <td><b>Hunts Id</b></td>
                <td><b>Update Questions</b></td>
                <td><b>Delete Questions</b></td>
                </tr>
             );
            
            questions.push(this.state.getQuestions.map(
                (n, index) =>               
                <tr key={n.id} id={n.id}>
                <td><textarea className={n.id} name='q' cols='15' defaultValue={n.question}></textarea></td>
                <td><textarea className={n.id} name='a' cols='15' defaultValue={n.answer}></textarea></td>
                <td><textarea className={n.id} name='i' cols='3' defaultValue={n.image}></textarea></td>
                <td><textarea className={n.id} name='h1' cols='10' defaultValue={n.hint_A}></textarea></td>
                <td><textarea className={n.id} name='h2' cols='10' defaultValue={n.hint_B}></textarea></td>
                <td><textarea className={n.id} name='at' cols='8'defaultValue={n.answer_text}></textarea></td>
                <td>{n.hunts_id}</td>
                <td><Button onClick={() => this.updateQuestion(n.id,
                                                               n.question,
                                                               n.answer,
                                                               n.image,
                                                               n.hint_A,
                                                               n.hint_B,
                                                               n.answer_text,
                                                               n.hunts_id)}>Update</Button></td>
                <td><Button onClick={() => this.deleteQuestion(n.id)}>Delete</Button></td>
                </tr>
             ));
        }
        return (
            <div>
                <div id = 'header'>
                    <header>Hunts</header>
                </div>
                <div id='intro'>
                    
                </div>
                <div id="userList">
                    <table id="admin-table2">
                        <tbody>
                            <tr>
                                <td><b>Name</b></td>
                                <td><b>Hunt Type</b></td>
                                <td><b>Description</b></td>
                                <td><b>Image</b></td>
                                <td><b>Start Date</b></td>
                                <td><b>End Date</b> </td>
                                <td><b>Start Text</b></td>
                                <td><b>Show Questions</b></td>
                                <td><b>Update Hunts</b> </td>
                                <td><b>Deletes Questions and Participants in the hunt</b> </td>
                            </tr>
                            {hunts}
                        </tbody>

                    </table>
                    
                </div>
                
                <div className='buttons'>
                    <form onSubmit = {this.handleSubmit}>
                        <FormGroup>
                            <InputGroup>
                                <ButtonToolbar>
                                    <Button onClick={() => this.change()}>Create Hunt</Button>
                                </ButtonToolbar>
                            </InputGroup>
                        </FormGroup>
                    </form>
                </div>
                
                <div id="userList">
                    <table id="admin-table2">
                        <tbody>
                            {questions}
                        </tbody>
                    </table>
                </div>
            </div>
         
        );
    }
}