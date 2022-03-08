import axios from 'axios';
class ApiService {
    constructor() {
        this.base = axios.create({
            baseURL: 'http://localhost:3000',
        });
    }
    createTemplate(props) {
        return new Promise((resolve, reject) => {
            this.base
                .post('/templates', props)
                .then(({ data }) => {
                resolve(data);
            })
                .catch(err => reject(err));
        });
    }
    downloadTemplate(props) {
        return new Promise((resolve, reject) => {
            this.base
                .post('/api/svg', props)
                .then(({ data }) => {
                resolve(data);
            })
                .catch(err => reject(err));
        });
    }
    getTemplates() {
        return new Promise(async (resolve, reject) => {
            try {
                const { data } = await this.base.get('/api/templates');
                resolve(data);
            }
            catch (err) {
                reject(err);
            }
        });
    }
    getElements() {
        return new Promise(async (resolve, reject) => {
            try {
                const { data } = await this.base.get('/api/elements');
                let unified = []
                data.map(category => category.files.map(file => {
                    unified.push({name: file.name, url: file.url})
                }))
                resolve(unified);
            }
            catch (err) {
                reject(err);
            }
        });
    }
    getPhotos() {
        return new Promise(async (resolve, reject) => {
            try {
                const { data } = await this.base.get('/api/photos');
                let unified = []
                data.map(category => category.files.map(file => {
                    unified.push({name: file.name, url: file.url})
                }))
                resolve(unified);
            }
            catch (err) {
                reject(err);
            }
        });
    }
    getFonts() {
        return new Promise(async (resolve, reject) => {
            try {
                const { data } = await this.base.get('/api/fonts');
                let unified = []
                data.map(family => family.fonts.map(font => {
                    unified.push(font)
                }))
                resolve(unified);
            }
            catch (err) {
                reject(err);
            }
        });
    }
    updateTemplate(id, props) {
        return new Promise((resolve, reject) => {
            this.base
                .put(`/templates/${id}`, props)
                .then(({ data }) => {
                resolve(data);
            })
                .catch(err => reject(err));
        });
    }
}
export default new ApiService();