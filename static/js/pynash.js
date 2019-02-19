let MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
    'August', 'September', 'October', 'November', 'December'];
let DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function amOrPM(hour) {
    am = true;
    if (hour >= 12) {
        am = false;
        hour = hour - 12;
    }
    return `${hour}:00${(am) ? 'am' : 'pm'}`;
}

function meetupInfo(meetups) {
    let meetup = meetups.data[0];
    let nextEvent = document.getElementById('next-event');

    let meetup_link = document.createElement('a');
    meetup_link.href = meetup.link;
    meetup_link.appendChild(document.createTextNode(meetup.name));

    let name = document.createElement('h3');
    name.appendChild(meetup_link);

    let when = document.createElement('p');
    let when_label = document.createElement('strong');
    when_label.appendChild(document.createTextNode('When? '));
    when_dt = new Date(meetup.time);

    when.appendChild(when_label);
    when.appendChild(document.createTextNode(`${DAYS[when_dt.getDay()]}, ${MONTHS[when_dt.getMonth()]} ${when_dt.getDate()}, ${when_dt.getFullYear()} @ ${amOrPM(when_dt.getHours())}`));


    let venue_label = document.createElement('strong');
    venue_label.appendChild(document.createTextNode('Where will we be? '));

    let venue_link = document.createElement('a');
    venue_link.href = `https://www.google.com/maps/search/${meetup.venue.name}, ${meetup.venue.address_1}`
    venue_link.appendChild(document.createTextNode(`${meetup.venue.name}, ${meetup.venue.address_1}`));

    let venue = document.createElement('p');
    venue.appendChild(venue_label);
    venue.appendChild(venue_link);

    let description = document.createElement('div')
    description.innerHTML = meetup.description;


    nextEvent.appendChild(name);
    nextEvent.appendChild(when);
    nextEvent.appendChild(venue);
    nextEvent.appendChild(description);
}
