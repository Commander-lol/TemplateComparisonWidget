var router = require("express").Router();

const indexData = {

}

router.get("/", (req, res) => {
  res.render("index", indexData);
});

module.exports = router;
