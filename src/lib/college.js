const searchColleges = {
    byName: async (query) => (await fetch(`http://universities.hipolabs.com/search?name=${query}`)).json(),
    byDomain: async (query) => (await fetch(`http://universities.hipolabs.com/search?domain=${query}`)).json()
}

export default searchColleges