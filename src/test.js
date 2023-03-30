const str  =  '\n' +
    'Parsed User Message:\n' +
    'Api Type: Aggregate\n' +
    'Metric: events\n' +
    'Property: event:name=Buy Now Click, visit:country=US, visit:utm_source=flolio \n' +
    'Duration: 2023-03-29 to 2023-04-05'

const parsedMessage = Object.fromEntries(str.trim().split('\n').slice(1).map(s => s.split(': ')));
const resp = {}
resp['api_type'] = parsedMessage['Api Type'] ? parsedMessage['Api Type'].toLowerCase() : null
resp['metric'] = parsedMessage['Metric'] ?? null
resp['properties'] = parsedMessage['Property'] ? parsedMessage['Property'].trim().split(', ') : null
resp['duration'] = parsedMessage['Duration'] ? parsedMessage['Duration'].split(' to ') : null

console.log(resp)
