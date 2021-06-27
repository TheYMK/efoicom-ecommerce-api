export const smartTrim = (str: any, length: any, delim: any, appendix: any) => {
	if (str.length <= length) return str;

	var trimmedStr = str.substr(0, length + delim.length);

	var lastDelimIndex = trimmedStr.lastIndexOf(delim);
	if (lastDelimIndex >= 0) trimmedStr = trimmedStr.substr(0, lastDelimIndex);

	if (trimmedStr) trimmedStr += appendix;

	return trimmedStr;
};
