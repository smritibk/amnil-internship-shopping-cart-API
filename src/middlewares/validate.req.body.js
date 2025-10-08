const validateReqBody = (validationSchema) => {
  return async (req, res, next) => {
    // if image is uploaded, get the image URL
    const imageUrl = req.file ? req.file.path : null;
    if (imageUrl) {
      req.body.image = imageUrl;
    }

    //extract data from req body
    const data = req.body;
    
    //if validation fails, throw error
    try {
      const validatedData = await validationSchema.validate(data);
      // console.log("validated data:", validatedData);
      req.body.email = validatedData.email;
    } catch (error) {
      return res.status(400).send({ message: error.message });
    }

    //call next() function
    next();
  };
};

export default validateReqBody;
