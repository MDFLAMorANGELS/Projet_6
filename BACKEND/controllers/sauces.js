const Sauce = require('../models/Sauce');
const fs = require('fs');

exports.createSauce = (req, res, next) => {
    const saucesObject = JSON.parse(req.body.sauce);
    delete saucesObject._id;
    const sauces = new Sauce({
      ...saucesObject,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    console.log(sauces);
    sauces.save()
      .then( () => {
          return res.status(201).json({ message: 'Objet enregistré !'})
        })
      .catch(error => {
        return res.status(400).json({ error })
    });
};

exports.likeSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
    .then( (sauce) => {
        //si l utilisateur aime la sauce
        if (req.body.like === 1 && !sauce.usersLiked.includes(req.body.userId)) {
            sauce.usersLiked.push(req.body.userId);
            sauce.likes++;
            sauce
            .save ()
            .then ( () => {
               return res.status(200).json({ message: 'L utilisateur aime la sauce' })
            })
            .catch ( (error) => {
               return res.status(500).json({ error: error })
            });
        }

        //si l utilisateur n aime pas la sauce
        if (req.body.like === -1 && !sauce.usersDisliked.includes(req.body.userId)) {
            sauce.usersDisliked.push(req.body.userId);
            sauce.dislikes++;
            sauce
            .save ()
            .then ( () => {
                return res.status(200).json({ message: 'L utilisateur n aime pas la sauce' })
             })
             .catch ( (error) => {
                return res.status(500).json({ error: error })
             });
         }

        //si l utlisateur change son appréciation
        if (req.body.like === 0 && sauce.usersLiked.includes(req.body.userId)) {
            sauce.usersLiked.pull(req.body.userId);
            sauce.likes--;
            sauce
            .save ()
            .then ( () => {
                return res.status(200).json({ message: 'L utilisateur retire la mention j aime' })
             })
             .catch ( (error) => {
                return res.status(500).json({ error: error })
             });
         }

        if (req.body.like === 0 && sauce.usersDisliked.includes(req.body.userId)) {
            sauce.usersDisliked.pull(req.body.userId);
            sauce.dislikes--;
            sauce
            .save ()
            .then ( () => {
                return res.status(200).json({ message: 'L utilisateur retire la mention j aime pas' })
             })
             .catch ( (error) => {
                return res.status(500).json({ error: error })
             });
         }
    });
};

exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
      } : { ...req.body };
      if (req.file) {
        Sauce.findOne({ _id: req.params.id })
        .then ( sauce => {
          const filename = sauce.imageUrl.split('/images/')[1];
          fs.unlink(`images/${filename}`, () => {
            updateSauce(sauceObject, req.params.id, res)
          })
      })
    } else {
        updateSauce(sauceObject, req.params.id, res)
      }
  };

  updateSauce = (sauce, id, res) => {
    Sauce.updateOne({ _id: id}, { ...sauce, _id: id })
    .then( () => {
        return res.status(200).json({ message: 'Objet modifié !'})
  })
    .catch(error => {
        return res.status(400).json({ error })
  });
  }
  exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
      .then ( sauce => {
        const filename = sauce.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
          Sauce.deleteOne({ _id: req.params.id })
            .then(() => {
                return res.status(200).json({ message: 'Objet supprimé !'})
            })
            .catch(error => {
                return res.status(400).json({ error })
            });
        });
      })
      .catch( error => res.status(500).json({ error }));
  };

exports.getAllSauces = (req, res, next) => {
    Sauce.find()
    .then( (sauces) => {
        return res.status(200).json(sauces)
        })
    .catch( (error) => {
        return res.status(400).json({ error: error});
    });
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
    .then( (sauces) => {
        return  res.status(200).json(sauces);
        })
    .catch((error) => {
        return res.status(404).json({ error: error })
    });
};