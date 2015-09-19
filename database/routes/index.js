var mongoose = require("mongoose");
var projects = mongoose.model('project');
var users = mongoose.model('user');

exports.getProject = function (req, res) {
    projects.findOne({ _id: req.params.id}, function(err, gotProjects) {
                if (err) {
                    console.log(err)
                } else {
                    res.send(gotProjects);
                }
    });
}

exports.getUserProjects = function (req, res) {

    projects.find({ user_created_id: req.params.id }, function (err, gotProjects) {
        if (err) {
            console.log(err);
            res.send(err);
        } else {
            res.send(gotProjects);
        }
    });
};

exports.getProjects = function (req, res) {
    
    projects.find({}, function (err, gotProjects) {
        if (err) {
            console.log(err);
            res.send(err);
        } else {
            res.send(gotProjects);
        }
    });
};

exports.getUser = function (req, res) {

    users.findOne({_id: req.params.id}, function (err, gotUser) {
        if (err) {
            console.log(err);
            res.send(err);
        } else {
            res.send(gotUser);
        }
    });
};

exports.getUsers = function (req, res) {


    users.find({}, function (err, gotUsers) {
        if (err) {
            console.log(err);
            res.send(err);
        } else {
            res.send(gotUsers);
        }
    });
}

exports.postUser = function (req, res) {
    var user = new users({
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        student_id: req.body.student_id,
        can_email: req.body.can_email,
        verified_email: req.body.verified_email
    });

    user.save(function () {
        res.send("Saved user: " + req.body.first_name)
    });
};

exports.postProject = function (req, res) {
    var project = new projects({
        user_created_id: req.body.user_created_id,
        title: req.body.title,
        description: req.body.description,
        min_age: req.body.min_age,
        max_age: req.body.max_age,
        required_gender: req.body.required_gender,
        required_student_email: req.body.required_student_email,
        other_requirements: req.body.other_requirements,
        compensation: req.body.compensation,
        time_commitment: req.body.time_commitment,
        contact_name: req.body.contact_name,
        contact_email: req.body.contact_email,
        register_url: req.body.register_url,
        location_address: req.body.location_address,
        location_city: req.body.location_city,
        location_state: req.body.location_state,
        location_lat: req.body.location_lat,
        location_long: req.body.location_long,
        institution: req.body.institution,
        start_date: req.body.start_date,
        end_date: req.body.end_date
    });

    project.save(function () {
        res.send("Saved study: " + req.body.title)
    });
};

exports.updateUser = function (req, res) {
    //look up 'upsert'
    users.update({ _id: req.params.id }, function (err, gotUser) {
        if (err) {
            console.log(err);
            res.send(err);
        } else {
            gotUser = new user({
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                email: req.body.email,
                can_email: req.body.can_email
            });

            res.send("Updated user: " + req.body.first_name)
        }
    });
};

exports.updateProject = function (req, res) {
    projects.update({ _id: req.params.id }, function (err, gotProject) {
        if (err) {
            console.log(err);
            res.send(err);
        } else {
            gotProject = new user({
                title: req.body.title,
                description: req.body.description,
                min_age: req.body.min_age,
                max_age: req.body.max_age,
                required_gender: req.body.required_gender,
                required_student_email: req.body.required_student_email,
                other_requirements: req.body.other_requirements,
                compensation: req.body.compensation,
                time_commitment: req.body.time_commitment,
                contact_name: req.body.contact_name,
                contact_email: req.body.contact_email,
                location_address: req.body.location_address,
                location_city: req.body.location_city,
                location_state: req.body.location_state,
                location_lat: req.body.location_lat,
                location_long: req.body.location_long,
                institution: req.body.institution,
                start_date: req.body.start_date,
                end_date: req.body.end_date
            });

            res.send("Updated project: " + req.body.title)
        }
    });
};

exports.dropProject = function (req, res) {
    //projects.remove({ _id: req.params.id }, function (err, gotProject) {
    //    if (err) {
    //        console.log(err);
    //        res.send(err);
    //    } else {
    //        res.send("Project removed: " + req.params.id)
    //    }
    //});
    projects.remove({ _id: req.params.id }, function (err, gotProject) {
        if (err) {
            console.log(err);
            res.send(err);
        } else {
            res.send("Project removed: " + req.params.id)
        }
    });
};