
const findSubscription = () => {
    const subscription = document.querySelector('.rc-widget');

    if (subscription) {
        return updateSubscription(subscription)
    }

    setTimeout(findSubscription, 10);
}

const updateSubscription = (subscriptionWidget) => {
    let tooltipContent = subscriptionWidget.querySelector('.rc-tooltip__content');
    
    const rcGroup = subscriptionWidget.querySelector('.rc-template__radio-group');

    tooltipContent.innerHTML = String(tooltipContent.innerHTML).replace("<br>", ': ');

    if (rcGroup) {

        const rcOptions = rcGroup.querySelector('.rc-radio-group__options');
        
        if (rcOptions && tooltipContent); {
            rcOptions.append(tooltipContent);
        }
    }
}

// findSubscription()