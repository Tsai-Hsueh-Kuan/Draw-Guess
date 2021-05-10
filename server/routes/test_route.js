const router = require('express').Router();


const {
    getCampaigns,

} = require('../controllers/test_controller');

router.route('/test')
    .get(getCampaigns);


module.exports = router;