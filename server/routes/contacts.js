const express = require('express');
const auth = require('../middleware/auth');
const Contacts = require('../models/Contacts');
const { check, validationResult } = require('express-validator');
const router = express.Router();


//desc adding a contact
//route POST api/contacts
//acess Private
router.post('/', [auth,
    [
        check('name', 'Name is required')
            .not()
            .isEmpty(),
        check('type', 'Type must be personal or professional').isIn([
            'personal',
            'professional'
        ])]
    ]
, async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, phone, type } = req.body;

    try {
        const newContact = await new Contacts({
            name,
            email,
            phone,
            type,
            user: req.user.id,
        });

        const contacts = await newContact.save();
        res.json(contacts);

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");

    }
});


//desc getting list of contacts
//route GET api/contacts
//acess Private
router.get('/', auth, async (req, res) => {
    try {
        const contacts = await Contacts.find({ user: req.user.id }).sort({ date: -1 });
        res.json(contacts);

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Token not available' });
    }
});


//desc updating contact
//route PUT api/contacts/id
//acess Private
router.put('/:id', auth, async (req, res) => {
    const errors = validationResult(req);
	if (!errors.isEmpty())
		return res.status(400).json({ errors: errors.array() });

	const { name, email, phone, type } = req.body;

	// Build contact object
	const contactFields = {};
	if (name) contactFields.name = name;
	if (email) contactFields.email = email;
	if (phone) contactFields.phone = phone;
	if (type) contactFields.type = type;

	try {
		let contact = await Contacts.findById(req.params.id);

		if (!contact) return res.status(404).json({ msg: 'Contact not found' });

		// Make sure user owns contact
		if (contact.user.toString() !== req.user.id)
			return res.status(401).json({ msg: 'Not authorized' });

		contact = await Contacts.findByIdAndUpdate(
			req.params.id,
			{ $set: contactFields },
			{ new: true }
		);

		res.json(contact);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error');
	}

});


//desc deleting contact
//route DELETE api/contacts/id
//acess Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const contact = await Contacts.findById(req.params.id);

        if (!contact) return res.status(404).json({ msg: 'Contact not found' });

        // Make sure user owns contact
        if (contact.user.toString() !== req.user.id)
            return res.status(401).json({ msg: 'Not authorized' });

        await Contacts.findByIdAndRemove(req.params.id);

        res.json({ msg: 'Contact removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;