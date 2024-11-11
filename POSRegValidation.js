const Validation = (values) => {
    let error = {};
    const username_pattern = /^([^\s@]+@[^\s@]+\.[^\s@]+)(\s*,\s*[^\s@]+@[^\s@]+\.[^\s@]+)*\s*$/;
    const Ipaddress_pattern =  /^\d+\.\d+\.\d+\.\d+$/;

    if (values.HostName === "") {
        error.HostName = "Host name should not be empty";
    }

    if (values.Ipaddress === "") {
        error.Ipaddress = "Ipadress should not be empty";
    } else if (!Ipaddress_pattern.test(values.Ipaddress)) {
        error.Ipaddress = "Please enter a valid Ip address (Example: 1234.1234.1234.1234)";
    }
    if (values.primarymail === "") {
        error.primarymail = "Please fill in the primary notification email";
    } else if (!username_pattern.test(values.primarymail)) {
        error.primarymail = "Please enter a valid email (e.g., example@gmail.com)";
    }

    if (values.escalationmail === "") {
        error.escalationmail = "Please fill in the escalation notification email";
    } else if (!username_pattern.test(values.escalationmail)) {
        error.escalationmail = "Please enter a valid email (e.g., example@gmail.com)";
    }

    if (values.description && values.description.length > 250) {
        error.description = "Character limit exceeded!";
    }

    return error;
};

export default Validation;
