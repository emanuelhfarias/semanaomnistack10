const axios = require('axios');
const Dev = require('../models/Dev');
const parseStringAsArray = require('../utils/parseStringAsArray');
const { findConnections, sendMessage } = require('../websocket');

/*
 * Um controller geralmente possui 5 funções:
 *    index, show, store, update e destroy
 */

module.exports = {

    async index(request, response) {
        const devs = await Dev.find();
        return response.json(devs);
    },

    async store(request, response) {
        const { github_username, techs, latitude, longitude } = request.body;
        let dev = await Dev.findOne({github_username});
        if (!dev) {
            const apiResponse = await axios.get(`https://api.github.com/users/${github_username}`);
            const { name = login, avatar_url, bio } = apiResponse.data;
            const techsArray = parseStringAsArray(techs);
            const location = {type: 'Point', coordinates: [latitude, longitude]}
            dev = await Dev.create({github_username, name, avatar_url, bio, techs: techsArray, location});

            // filtrar as conexões que estão no máximo 10km de dist e que o novo DEV tenha uma das Techs listadas
            const sendSocketMessageTo = findConnections(
              {latitude, longitude},
              techsArray
            );
            console.log(`> sendSocketMessageTo: ${sendSocketMessageTo.length}`)
            sendMessage(sendSocketMessageTo, 'new-dev', dev);
        }
        return response.json(dev);
    },

    async update() {
    },

    async destroy() {
    }

};