import React, { Component } from 'react';
import { Button } from 'antd';

// To deal with a value that changes in a component
// we use state and setstate

// need to create a component state to control the value of the component



class Form extends Component {

    constructor(props) {
        super(props)

        this.state = {
            // create new state property called username and initalise it to a string
            // then assign this state value to input prop
            username: '',
            comments: '',
            topic: 'react'
        }
    }

    // handling the onchange event
    // handle the method as a class property?

    // one parameter called event from this event
    // we can extract the value frpm event.target.value 
    // to update the state we will use the setState
    handleUsernameChange = (event) => {
        this.setState({
            username: event.target.value
        })
    }

    handleCommentsChange = (event) => {
        this.setState({
            comments: event.target.value
        })
    }

    handleTopicChange = (event) => {
        this.setState({
            topic: event.target.value
        })
    }

    handleSubmit = event => {
        alert(`${this.state.username} ${this.state.comments} ${this.state.topic}`)
        event.preventDefault()
    }
  render() {
  return (
    <form onSubmit={this.handleSubmit}>
        <div>
            <label>Username</label>
            <input 
             type='text'
             value={this.state.username}
             onChange={this.handleUsernameChange}/>
        </div>
        <div>
            <label>Comments</label>
            <textarea 
            value={this.state.comments} 
            onChange={this.handleCommentsChange}></textarea>
        </div>
        <div>
            <label>Topic</label>
            <select value={this.state.topic} onChange={this.handleTopicChange}>
                <option value="react">React</option>
                <option value="angular">Angular</option>
                <option value="vue">Vue</option>
            </select>
        </div>
        <button type="submit">Submit</button>
    </form>
  );
  }
}

export default Form;
