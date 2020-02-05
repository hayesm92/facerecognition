import React, {Component} from 'react';
import Navigation from './Components/Navigation/Navigation';
import Logo from './Components/Logo/Logo';
import ImageLinkForm from './Components/ImageLinkForm/ImageLinkForm';
import FaceRecognition from './Components/FaceRecognition/FaceRecognition';
import Signin from './Components/Signin/Signin';
import Register from './Components/Register/Register';
import Rank from './Components/Rank/Rank';
import './App.css';
import Particles from 'react-particles-js';





const particlesOptions = {
    particles: {
      number: {
        value: 120,
        density: {
          enable: true,
          value_area: 800
        }
      }
    }
}

const initialState = {
  input: '',
  imageUrl: '',
  box: {},
  route: '',
  isSignedIn: false,
  user: {
    id: '',
    name: '',
    email: '',
    entries: 0,
    joined: ''
  }
}

class App extends Component {
  constructor(){
    super();
    this.state = {
      input: '',
      imageUrl: '',
      box: {},
      route: '',
      isSignedIn: false,
      user: {
        id: '',
        name: '',
        email: '',
        entries: 0,
        joined: ''
      }
    }
  }

loadUser = (data) =>{
  this.setState({
    data: {
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
    }
  })
}

  calculateFaceLocation = (data) =>{
   const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
   const image = document.getElementById('inputImage')
   const width = Number(image.width);
   const height = Number(image.height);
   return {
     leftCol: clarifaiFace.left_col * width,
     topRow: clarifaiFace.top_row * height,
     rightCol: width - (clarifaiFace.right_col * width),
     bottomRow: height - (clarifaiFace.bottom_row * height)
   }
  }



  displayFaceBox = (box) =>{
    this.setState({box: box});
  }

  onInputChange = (event) =>{
    this.setState({
      input: event.target.value
    })
  }

  onButtonSubmit = () =>{
    this.setState({imageUrl: this.state.input})
        fetch('https://fast-sea-27249.herokuapp.com/imageurl', {
        method: 'post',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          input: this.state.input
      })
    })
  
    .then(response => response.json())
    .then(response => {
      if (response) {
        fetch('https://fast-sea-27249.herokuapp.com/image', {
          method: 'put',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            id: this.state.user.id
          })


        })
        .then(response => response.json())
        .then(count => {
          this.setState(
            {user: Object.assign(this.state.user)}, 
            {entries: count}
        )})
        .catch(err => console.log(err))
        }
      this.displayFaceBox(this.calculateFaceLocation(response))
      })
    .catch(err => console.log(err));
    
  }
    

  onRouteChange = (route) => {
    if( route === 'signout'){
      this.setState({initialState})
    } else if(route === 'home'){
      this.setState({isSignedIn: true})
    }
    this.setState({route: route})

  }

  render(){

    const {isSignedIn, imageUrl, route, box } = this.state;

    return (
      <div className="App">
        
        <Particles className='particles' params= {particlesOptions} />
          <Navigation isSignedIn = {isSignedIn} onRouteChange = {this.onRouteChange}/>
          {route === 'home' ? 
            <div> 
              <Logo />
              <Rank name = {this.state.data.name} entries = {this.state.data.entries}/>
              <ImageLinkForm onInputChange = {this.onInputChange} onButtonSubmit = {this.onButtonSubmit} />
              <FaceRecognition box = {box} imageUrl ={imageUrl}/>
            </div> : (
              route === 'signin' 
              ? <Signin loadUser={this.loadUser} onRouteChange = {this.onRouteChange}/>
              : <Register loadUser = {this.loadUser} onRouteChange = {this.onRouteChange}/>

            )
            
              
          }


      </div>
    );
  }
}
export default App;
