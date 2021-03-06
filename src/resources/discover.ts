export default {
  playlist: (options: any) => {
    return `playlist/${options.id}/tracks?output=jsonp&index=${
      options.index
    }&limit=24`;
  },
  search: (options: any) => {
    return `search?q=${options.term}&output=jsonp&index=${
      options.index
    }&limit=24`;
  }
};
