import axios from 'axios';

const HOME = axios.create({
    baseURL: `/api`,
    timeout: 10000
  });

export default {
    getProjects(){
        return HOME.get('/projects');
    }

}

//   /projects
//   home
//   samples
//   adminpanel
//   config par projet