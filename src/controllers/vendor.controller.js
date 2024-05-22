const VendorModel = require('../models/vendor.model');

const getVendorProfiles = async (req, res) => {
    try {
        const user = req.user
        if (user.roleid == 1 || user.roleid == 3) {
            const vendors = await VendorModel.getAllVendorProfiles();
            return res.json({ success: true, data: vendors });
        }
        const vendors = await VendorModel.getVendorProfiles(user.userprofileid);
        res.json({ success: true, data: vendors });
    } catch (err) {
        console.log(err)
        res.status(500).json({ success: false, message: err.message });
    }
};

const addVendor = async (req, res) => {
    try {
        const user = req.user
        const { name, emailaddress1, emailaddress2, contactnumber, officenumber, url, city, area, street, building, zipcode } = req.body;
        const image = req.file

        if (user.roleid == 1) {
            const newObj = await VendorModel.addVendorFromAdmin(name, emailaddress1, emailaddress2, contactnumber, officenumber, url, city, area, street, building, zipcode, image);
            return res.status(201).json({ success: true, data: newObj });
        }

        const newObj = await VendorModel.addVendor(name, emailaddress1, emailaddress2, contactnumber, officenumber, url, city, area, street, building, zipcode, image, user.userprofileid);
        console.log('newObj', newObj)
        return res.status(201).json({ success: true, data: newObj });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};

const updateVendor = async (req, res) => {
    try {
        const id = req.params.id;
        const { name, emailaddress1, emailaddress2, contactnumber, officenumber, url, city, area, street, building, zipcode } = req.body;
        const image = req.file
        const newObj = await VendorModel.updateVendor(id, name, emailaddress1, emailaddress2, contactnumber, officenumber, url, city, area, street, building, zipcode, image);

        res.status(200).json({ success: true, data: newObj });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};

const deleteVendor = async (req, res) => {
    try {
        const id = req.params.id;
        const deleted = await VendorModel.deleteVendor(id);
        if (deleted) {
            res.status(200).json({ success: true, message: 'Vendor deleted successfully' });
        } else {
            res.status(404).json({ success: false, message: 'Vendor not found' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    addVendor,
    getVendorProfiles,
    updateVendor,
    deleteVendor
};