const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
    'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function amOrPM(hour) {
    let am = true;
    if (hour >= 12) {
        am = false;
        hour = hour - 12;
    }
    return `${hour}:00${(am) ? 'am' : 'pm'}`;
}

function d(tag, content, children, attributes) {
    let t = document.createElement(tag);

    if (attributes !== undefined) {
        for (var key in attributes) {
            t[key] = attributes[key];
        }
    }

    for (var idx in children) {
        t.appendChild(children[idx]);
    }

    if (content.length) {
        t.appendChild(document.createTextNode(content));
    }
    return t;
}

function meetupInfo(meetups) {
    const meetup = meetups.data[0];
    let nextEvent = document.getElementById('next-event');

    let name = d('h3', '', [
        d('a', meetup.name, [], {'href': meetup.link})
    ]);

    let when_dt = new Date(meetup.time);
    let day_and_time = `${DAYS[when_dt.getDay()]}, ${MONTHS[when_dt.getMonth()]} ${when_dt.getDate()}, ${when_dt.getFullYear()} @ ${amOrPM(when_dt.getHours())}`;
    let when = d('p', day_and_time, [
        d('strong', 'When? ', [])
    ]);

    let venue_link = `${meetup.venue.name}, ${meetup.venue.address_1}`;
    let venue_url = `https://www.google.com/maps/search/${venue_link}`;
    let venue = d('p', '', [
        d('strong', 'Where will we be? ', []),
        d('a', venue_link, [], {'href': venue_url})
    ]);

    let description = d('div', '', []);
    description.innerHTML = meetup.description;

    nextEvent.appendChild(name);
    nextEvent.appendChild(when);
    nextEvent.appendChild(venue);
    nextEvent.appendChild(description);
}
