#Custom Looker Visualizations

####Preliminaries:
1. In order to utilize Looker's visualization plugin, a license feature must first be enabled. Use in-app chat, email support, or email a Looker analyst and ask them to turn on this feature. Once this is done, you will need to update your license key in the admin panel.
2. At present, only on-premise (*i.e.*, customer hosted) Lookers support custom visualizations. This is because one needs access to the file system to add and remove custom JavaScript.
3. Looker's Customer Support team does not troubleshoot *any* issues that pertain to custom visualizations. Custom visualizations are a community supported effort. Please use issues for tracking and closing out bugs, and visit https://discourse.looker.com for how-to articles, conversations, and tips regarding custom visualizations.

####Getting Started:
Looker versions 3.14.xx and later ship with a directory intended to hold scripts for custom visualizations and other extensions. It is located on the machine hosting looker: ```~/looker/plugins/visualizations```. This is where you'll find our heatmap example to get you started. You will need to read and edit the heatmap example file to use it.

Once a custom visualiation script is saved in the above-mentioned directory, you can use it in the explore section or a dashboard by selecting it within the visualiation editor in list of additional visualiations (the ellipsis).

![ScreenShot](http://s13.postimg.org/hg3h4fdjb/location.jpg?raw=true)

Which looks like this:

![ScreenShot](http://s8.postimg.org/n87cxkbid/Screen_Shot_2015_03_25_at_8_21_59_AM.png?raw=true)
