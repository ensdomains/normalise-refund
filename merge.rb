require 'CSV'

inputPath = 'data_270623/refund_addresses.csv'
inputPath2 = 'data_021123/refund_addresses.csv'
old_addresses = CSV.readlines(inputPath)[1..-1]
new_addresses = CSV.readlines(inputPath2)[1..-1]
dict = {}
old_addresses.map do |item| 
address, names, fee_last_remmaining, fee_last_all, fee_all, premium, gas = item
    dict[address] = {
        'address':address,
        'old_names':names.to_f,
        'old_fee_last_remmaining':fee_last_remmaining.to_f,
        'old_premium':premium.to_f,
        'old_gas':gas.to_f,
        'old_total': (fee_last_remmaining.to_f + premium.to_f + gas.to_f),
        'new_names':0,
        'new_fee_last_remmaining':0,
        'new_premium':0,
        'new_gas':0,
        'new_total':0,
    }
end
new_addresses.map do |item|
address, names, fee_last_remmaining, fee_last_all, fee_all, premium, gas = item
    new_total = (fee_last_remmaining.to_f + premium.to_f + gas.to_f)
    if dict[address]
        dict[address][:new_names] = names.to_f
        dict[address][:new_fee_last_remmaining] = fee_last_remmaining.to_f
        dict[address][:new_premium] = premium.to_f
        dict[address][:new_gas] = gas.to_f
        dict[address][:new_total] =  new_total
        dict[address][:diff] =  new_total - dict[address][:old_total]
    else
        dict[address] = {
            'address':address,
            'old_names':0,
            'old_fee_last_remmaining':0,
            'old_premium':0,
            'old_gas':0,
            'old_total':0,
            'new_names':names.to_f,
            'new_fee_last_remmaining':fee_last_remmaining.to_f,
            'new_premium':premium.to_f,
            'new_gas':gas.to_f,
            'new_total': new_total,
            'diff': new_total
        }
    end
end
pp "total"
pp dict.values.length
both = dict.values.select{|v| v[:new_total] > 0 && v[:old_total] > 0}
only_old = dict.values.select{|v| v[:new_total] == 0}
diff_amount = 0.01
big_old = dict.values.select{|v| p v; (v[:old_total] - v[:new_total]) > diff_amount}
only_new = dict.values.select{|v| v[:old_total] == 0}
big_new = dict.values.select{|v| p v; (v[:new_total] - v[:old_total]) > diff_amount}
pp "both"
pp both.length
pp "only_old"
pp only_old.length
pp "big_old"
pp big_old.length
pp "only_new"
pp only_new.length
pp "big_new"
pp big_new.length
all_old = dict.values.select{|v| v[:old_total] != 0 }.map{|v| v[:old_total]}
pp "old_count"
pp old_count = all_old.length
pp "old_sum"
pp old_sum = all_old.sum
pp "old_avg"
pp old_avg = all_old.sum / all_old.length
all_new = dict.values.select{|v| v[:new_total] != 0 }.map{|v| v[:new_total]}
pp "new_count"
pp new_count = all_new.length
pp "new_sum"
pp new_sum = all_new.sum
pp "new_avg"
pp new_avg = all_new.sum / all_new.length

puts "col: count\tsum\t\t\tavg\t\t        only\t> #{diff_amount} ETH diff"
puts "old: #{old_count}\t #{old_sum}\t #{old_avg}\t #{only_old.length}\t  #{big_old.length}\t"
puts "new: #{new_count}\t #{new_sum}\t #{new_avg}\t #{only_new.length}\t  #{big_new.length}\t"


pp dict.values.first.keys.map{|k| k.to_s}
header = dict.values.first.keys.map{|k| k.to_s}
CSV.open("./merge.csv", "wb") do |csv|
  pp header
  csv << header
  dict.values.map{|v| 
    csv << v.values
  }
end