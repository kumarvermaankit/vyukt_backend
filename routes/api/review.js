const express = require('express');
const router = express.Router();

// Bring in Models & Helpers
const Review = require('../../models/review');
const Product = require('../../models/product');
const auth = require('../../middleware/auth');

router.post('/add', auth, (req, res) => {
  const user = req.user;

  const review = new Review(Object.assign(req.body, { user: user._id }));

  review.save((err, data) => {
    if (err) {
      return res.status(400).json({
        error: 'Your request could not be processed. Please try again.'
      });
    }

    res.status(200).json({
      success: true,
      message: `Your review has been added successfully and will appear when approved!`,
      review: data
    });
  });
});

// fetch all reviews api
router.get('/', async (req, res) => {
  console.log("tttttt")
  try {
    const { page = 1, limit = 10 } = req.query;

    const reviews = await Review.find()
      .sort('-created')
      .populate({
        path: 'user',
        select: 'firstName'
      })
      .populate({
        path: 'product',
        select: 'name slug imageUrl'
      })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Review.countDocuments();

    res.status(200).json({
      reviews,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      count
    });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

router.get('/:slug', async (req, res) => {
  console.log("asjbhhjs")
  try {
    const productDoc = await Product.findOne({ slug: req.params.slug });
    console.log(productDoc)
    const hasNoBrand =
      productDoc.brand === null || productDoc.brand.isActive === false;

    if (!productDoc || hasNoBrand) {
      return res.status(404).json({
        message: 'No product found.'
      });
    }

    const reviews = await Review.find({
      product: productDoc._id,
      status: 'Approved'
    })
      .populate({
        path: 'user',
        select: 'firstName'
      })
      .sort('-created');

    res.status(200).json({
      reviews
    });
  } catch (error) {
    console.log(error)
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

router.put('/:id', async (req, res) => {

  try {
    const reviewId = req.params.id;
    const update = req.body;
    const query = { _id: reviewId };

    await Review.findOneAndUpdate(query, update, {
      new: true
    });

    res.status(200).json({
      success: true,
      message: 'review has been updated successfully!'
    });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

// approve review
router.put('/approve/:reviewId', auth, async (req, res) => {
  try {
    const reviewId = req.params.reviewId;

    const query = { _id: reviewId };
    const update = {
      status: 'Approved',
      isActive: true
    };

    await Review.findOneAndUpdate(query, update, {
      new: true
    });

    res.status(200).json({
      success: true
    });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

// reject review
router.put('/reject/:reviewId', auth, async (req, res) => {
  try {
    const reviewId = req.params.reviewId;

    const query = { _id: reviewId };
    const update = {
      status: 'Rejected'
    };

    await Review.findOneAndUpdate(query, update, {
      new: true
    });

    res.status(200).json({
      success: true
    });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

router.delete('/delete/:id', async (req, res) => {
  try {
    const review = await Review.deleteOne({ _id: req.params.id });

    res.status(200).json({
      success: true,
      message: `review has been deleted successfully!`,
      review
    });
  } catch (error) {
    return res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

module.exports = router;